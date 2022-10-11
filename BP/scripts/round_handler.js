import { world, MolangVariableMap, EntityQueryOptions, BlockLocation } from "mojang-minecraft"
import { randomInt, randomFloat, getPlayers } from './utility.js'
import { spawnPool } from "./spawn_pool.js"
import { restartLobby } from "./lobby.js"

let progressQuery = {}
progressQuery.type = 'home:round_progress'

let remainingMonsters = 0
let playersReady = 0


//Commands
world.events.beforeChat.subscribe(data => {
    const message = data.message
    const source = data.sender
    const dimension = world.getDimension(data.sender.dimension.id)

    switch (message) {
        case '!start':
            data.cancel = true
            if (source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            startWave(dimension, 1)
            break
        case '!removeProperties':
            data.cancel = true
            if (source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            world.setDynamicProperty("SpawnLocationData", "false")
            dimension.runCommand('say Removed Properties')
            break
        case '!properties':
            data.cancel = true
            if (source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            dimension.runCommand(`say ${world.getDynamicProperty("SpawnLocationData")}`)
            break
        case '!end':
            data.cancel = true
            if (source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            startWave(dimension, 1, true)
            break
        case '!ready':
            data.cancel = true

            if (!source.hasTag('lobby')) {
                dimension.runCommand('say The game has already begun!')
                break
            }

            if (source.hasTag('ready')) {
                dimension.runCommand('say You are already ready!')
                break
            }

            playersReady++

            source.addTag('ready')

            dimension.runCommand(`tellraw @a {"rawtext":[{"text":"§a${source.name} is Ready!"}]}`)

            if (playersReady === getPlayers(false)) {
                dimension.runCommand(`tellraw @a {"rawtext":[{"text":"§dEveryone is ready, game start!"}]}`)

                dimension.runCommand(`function remove_lobby`)
                playersReady = 0

                startWave(dimension, 1)
            }

            break
        case '!debug':
            data.cancel = true
            dimension.runCommand('say Debug mode enabled.')
            source.removeTag('lobby')
            source.addTag('debug')
            source.runCommand('function remove_lobby')
            break

        default:
            break
    }
})

function calculateSpawnDelay(round) {
    return 1 / (((round - 1) / 9) + 1)
}


/**
 * @remarks Starts a new round.
 * @param {dimension} dimension.
 * @param {round} integer The start round
 * @param {boolean} boolean Should it be an automatic end?
 * */
function startWave(dimension, round, end) {
    let spawnEnd = false
    let roundEndA = false
    let roundEndB = false
    let ended = false

    if (end) {
        endRound(false)
        return
    }


    const totalMonsters = getPlayers(false) * round + 3
    remainingMonsters = totalMonsters

    clearRoundProgress()

    setRoundProgress(remainingMonsters, totalMonsters, true, "monsters")

    dimension.runCommand(`function expired`)
    dimension.runCommand(`title @a title §4Round ${round}`)
    dimension.runCommand(`tellraw @a {"rawtext":[{"text":"Zombies this round: §c${totalMonsters}"}]}`)

    let spawnLocationsObject = JSON.parse(world.getDynamicProperty("SpawnLocationData"))

    let spawnLocations = {}

    for (let spawnData in spawnLocationsObject) {
        const foundData = spawnLocationsObject[spawnData]

        spawnLocations[spawnData] = {
            x: foundData.x,
            y: foundData.y,
            z: foundData.z,
            remaining_zombies: 0,
            current_second: 0,
            spawn_rate: randomFloat(4 * calculateSpawnDelay(round), 9 * calculateSpawnDelay(round))
        }
    }

    let spawnsFinished = 0
    let endTicks = 0

    let remainingSpawnLocations = 6
    let remainingTotalMonsters = totalMonsters

    for (let spawnLocation in spawnLocations) {
        spawnLocation = spawnLocations[spawnLocation]
        spawnLocation.remaining_zombies = 0
        spawnLocation.remaining_zombies = weightedRound(remainingTotalMonsters / remainingSpawnLocations)

        remainingSpawnLocations--
        remainingTotalMonsters -= spawnLocation.remaining_zombies
    }

    function spawnZombs() {
        const alivePlayers = getPlayers(false)

        if ((alivePlayers <= 0 || alivePlayers === undefined) && !ended) {
            endRound(false)
        }

        if (!roundEndA) {
            checkZombs()
        }

        if (roundEndA && !roundEndB) {
            endTicks++

            setRoundProgress(endTicks, 600, endTicks === 1, "timer")

            if (endTicks === 600) {
                clearRoundProgress()

                roundEndB = true
            }
        }

        if (spawnEnd && roundEndB && !ended) {
            world.events.tick.unsubscribe(spawnZombs)

            ended = true
            startWave(dimension, round + 1)

            return
        }

        if (!spawnEnd) {
            for (let spawnLocation in spawnLocations) {
                spawnLocation = spawnLocations[spawnLocation]

                spawnLocation.current_second += 1 / 20

                if (spawnLocation.current_second >= spawnLocation.spawn_rate) {
                    spawnLocation.current_second = 0

                    if (spawnLocation.remaining_zombies <= 0) {
                        spawnsFinished++

                        if (spawnsFinished >= 6) {
                            spawnEnd = true
                        }
                    } else {
                        let spawnLocationZ = new BlockLocation(spawnLocation.x, spawnLocation.y, spawnLocation.z)

                        const identifier = randomMonster()
                        const monster = dimension.spawnEntity(identifier, spawnLocationZ)
                        dimension.spawnParticle("home:spawn_explosion_particle", monster.location, new MolangVariableMap())

                        spawnLocation.remaining_zombies--
                        spawnLocation.spawn_rate = randomFloat(4 * calculateSpawnDelay(round), 9 * calculateSpawnDelay(round))
                    }
                }
            }
        }
    }

    function weightedRound(x) {
        let result = x

        if (x - Math.floor(x) < Math.random()) {
            result = Math.floor(result)
        } else {
            result = Math.ceil(result)
        }

        return result
    }

    function checkZombs() {
        setRoundProgress(remainingMonsters, totalMonsters, false, "monsters")

        if (spawnEnd) {
            let monsterQuery = {}
            monsterQuery.families = ['monster']
            const monsters = dimension.getEntities(monsterQuery)

            if (Array.from(monsters).length === 0) {
                endRound(true)
            }
        }
    }

    /**
     * @remarks Ends the current round.
     * @param {boolean} victory If true, the players won the round.
     * @throws This function can throw errors.
     */
    function endRound(victory) {
        clearRoundProgress()

        roundEndA = true

        if (victory) {
            dimension.runCommand("title @a title §eRound End")
        } else {
            dimension.runCommand(`tellraw @a {"rawtext":[{"text":"Game Over! You lasted ${round - 1} ${round === 2 ? "round" : "rounds"}."}]}`)

            restartLobby()

            dimension.runCommand("function fail")

            world.events.tick.unsubscribe(spawnZombs)

            ended = true
            spawnEnd = true
            roundEndB = true
        }
    }

    /**
     * @remarks Kills all round progress entities that don't share the specified name tag.
     * @param {string} nameTag Optional name tag that will be checked.
     * @returns {boolean} Returns true if any entities were killed.
     */
    function clearRoundProgress(nameTag = "") {
        let result = false

        for (let entity of dimension.getEntities(progressQuery)) {
            if (entity.nameTag !== nameTag || nameTag === "") {
                entity.triggerEvent("home:instant_despawn")
                result = true
            }
        }

        return result
    }

    function randomMonster() {
        let spawnGroup = []

        for (let i = 0; i < spawnPool.length; i++) {
            if (round < spawnPool[i].min || round > spawnPool[i].max) continue

            for (let j = 0; j < spawnPool[i].weight; j++) spawnGroup.push(spawnPool[i].identifier)
        }

        return spawnGroup[randomInt(0, spawnGroup.length - 1)]
    }

    /**
     * @remarks Summons a new round progress entity, then sets its health and name tag accordingly.
     * @param {number} value The number of monsters or time remaining.
     * @param {number} max The maximum number of monsters or time that may remain.
     * @param {boolean} override If true, a new entity will be summoned and older entities will be despawned regardless of other conditions.
     * @param {string} mode Optional parameter that sets hardcoded properties for the round progress.
     * @throws This function can throw errors.
     */
    function setRoundProgress(value, max, override = false, mode = "monsters") {
        let progressTitle = "Round " + (round + (mode === "timer" ? 1 : 0))

        if (value < 3 && mode === "monsters") {
            progressTitle = "Monsters Remaining: " + value
        }

        if (override) {
            clearRoundProgress()

            dimension.runCommand(`summon home:round_progress "${progressTitle}" -168 -48 37`)
        } else {
            const newProgress = clearRoundProgress(progressTitle)

            if (newProgress) {
                dimension.runCommand(`summon home:round_progress "${progressTitle}" -168 -48 37`)
            }
        }

        for (let progress of dimension.getEntities(progressQuery)) {
            progress.getComponent("minecraft:health").setCurrent(value / max * 500)

            if (progress.getComponent("minecraft:health").current <= 0) {
                progress.triggerEvent("home:instant_despawn")
            }
        }
    }

    world.events.tick.subscribe(spawnZombs)
}

world.events.entityHurt.subscribe(entityHurt => {
    const entity = entityHurt.hurtEntity

    if (entity.getComponent("minecraft:health").current <= 0 && entity.hasTag("monster")) {
        remainingMonsters--
    }
})