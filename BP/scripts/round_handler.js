import { world, MolangVariableMap, BlockLocation, Location } from 'mojang-minecraft'
import { randomFloat, getAlivePlayerCount } from './utility.js'
import { randomMonster } from './spawn_pool.js'
import { rerender } from './lobby.js'

let currentRound = 1

let roundProgressEntity = null
let lastRoundProgressName = ''

/**
 * @remarks Kills all round progress entities
 */
function clearRoundProgress() {
    if (roundProgressEntity != null) roundProgressEntity.triggerEvent('home:instant_despawn')

    lastRoundProgressName = ''
}

/**
 * @remarks Creates a new progress entity if there is none and updates it's data for when a round is in progress
 * @param {number} value The number of monsters remaining.
 * @param {number} max The maximum number of monsters that may remain.
 */
function setRoundProgress(value, max) {
    const dimension = world.getDimension('overworld')

    let name = `Round ${currentRound}`

    if (value < 3) name = `Monsters Remaining: ${value}`

    if (!roundProgressEntity || lastRoundProgressName != name) {
        for (let entity of dimension.getEntities({ type: 'home:round_progress' })) {
            entity.triggerEvent("home:instant_despawn")
        }

        dimension.runCommand(`summon home:round_progress "${name}" -168 -48 37`)

        for (let entity of dimension.getEntities({ type: 'home:round_progress' })) {
            roundProgressEntity = entity
        }

        lastRoundProgressName = name
    }

    if (roundProgressEntity.getComponent('minecraft:health')) roundProgressEntity.getComponent('minecraft:health').setCurrent(value / max * 500)
}

/**
 * @remarks Creates a new progress entity if there is none and updates it's data for when a round is in an intermission
 * @param {number} value The number of time remaining.
 * @param {number} max The maximum number of time that may remain.
 */
function setRoundIntermissionProgress(value, max) {
    const dimension = world.getDimension('overworld')

    let name = `Round ${currentRound + 1}`

    if (!roundProgressEntity || lastRoundProgressName != name) {
        for (let entity of dimension.getEntities({ type: 'home:round_progress' })) {
            entity.triggerEvent("home:instant_despawn")
        }

        dimension.runCommand(`summon home:round_progress "${name}" -168 -48 37`)

        for (let entity of dimension.getEntities({ type: 'home:round_progress' })) {
            roundProgressEntity = entity
        }

        lastRoundProgressName = name
    }

    if (roundProgressEntity.getComponent('minecraft:health')) roundProgressEntity.getComponent('minecraft:health').setCurrent(value / max * 500)
}

// Returns a random tick amount which spawners will wait for between spawns
function calculateSpawnRate(round) {
    const factor = 1 / (((round - 1) / 9) + 1)

    return Math.floor(randomFloat(4 * factor, 9 * factor) * 20)
}

let monstersThisRound = 0
let monstersRemaining = 0

let gameInProgress = false

export function beginGame() {
    if (gameInProgress) endGame()

    currentRound = 1

    beginRound()
}

let spawners = []

/**
 * @remarks Starts a new round
 * */
export function beginRound() {
    const dimension = world.getDimension('overworld')

    inIntermission = false

    gameInProgress = true

    stillSpawning = true

    ticksTillIntermissionFinished = 0

    monstersThisRound = getAlivePlayerCount() * currentRound + 3
    let monstersToDistribute = monstersThisRound

    monstersRemaining = monstersThisRound

    setRoundProgress(monstersThisRound, monstersThisRound)

    dimension.runCommand(`function expired`)
    dimension.runCommand(`title @a title §4Round ${currentRound}`)
    dimension.runCommand(`tellraw @a {"rawtext":[{"text":"Zombies this round: §c${monstersThisRound}"}]}`)

    spawners = []

    const loadedData = JSON.parse(world.getDynamicProperty('SpawnLocationData'))

    for (const key of Object.keys(loadedData)) {
        const data = loadedData[key]

        spawners.push({
            x: data.x,
            y: data.y,
            z: data.z,
            currentTick: 0,
            spawnRate: calculateSpawnRate(currentRound)
        })
    }

    let remainingSpawners = spawners.length

    for (let spawner of spawners) {
        spawner.remainingMonsters = Math.round(monstersToDistribute / remainingSpawners)

        remainingSpawners--
        monstersToDistribute -= spawner.remainingMonsters
    }

    spawners = spawners.filter(spawner => spawner.remainingMonsters > 0)
}

export function endGame() {
    const dimension = world.getDimension('overworld')

    clearRoundProgress()

    dimension.runCommand(`tellraw @a {"rawtext":[{"text":"ame Over! You lasted ${currentRound - 1} ${currentRound == 2 ? 'round' : 'rounds'}."}]}`)

    dimension.runCommand('function fail')

    rerender()

    gameInProgress = false
    inIntermission = false
    stillSpawning = false
}

let inIntermission = false

let stillSpawning = false

let ticksTillIntermissionFinished = 0

world.events.tick.subscribe(() => {
    const dimension = world.getDimension('overworld')

    if (!gameInProgress) return

    if (getAlivePlayerCount() == 0) {
        endGame()

        return
    }

    if (!inIntermission) {
        // round in progress

        if (stillSpawning) {
            // there are still spawners that need to spawn

            // handle spawning here  ||
            //                       \/

            for (let i = 0; i < spawners.length; i++) {
                const spawner = spawners[i]

                if (spawner.remainingMonsters <= 0) continue

                spawner.currentTick++

                if (spawner.currentTick < spawner.spawnRate) continue

                spawner.currentTick = 0

                let spawnLocation = new BlockLocation(spawner.x, spawner.y, spawner.z)

                const identifier = randomMonster(currentRound)
                const monster = dimension.spawnEntity(identifier, spawnLocation)
                dimension.spawnParticle('home:spawn_explosion_particle', monster.location, new MolangVariableMap())

                spawner.remainingMonsters--
                spawner.spawnRate = calculateSpawnRate(currentRound)

                if (spawner.remainingMonsters > 0) continue

                spawners.splice(i, 1)
                i--

                if (spawners.length == 0) stillSpawning = false
            }
        } else {
            if (monstersRemaining <= 0) {
                // spawners are done spawning and no more monsters

                inIntermission = true
                ticksTillIntermissionFinished = 0

                dimension.runCommand('title @a title §eRound End')
            }
        }
    } else {
        // in intermission

        ticksTillIntermissionFinished++

        setRoundIntermissionProgress(ticksTillIntermissionFinished, 600)

        if (ticksTillIntermissionFinished == 600) {
            currentRound++

            beginRound()
        }
    }
})

world.events.entityHurt.subscribe(event => {
    if (!event.hurtEntity.hasTag('monster')) return

    if (event.hurtEntity.getComponent('minecraft:health').current > 0) return

    monstersRemaining--

    if (monstersRemaining > 0) setRoundProgress(monstersRemaining, monstersThisRound)
})