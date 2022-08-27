import { world, MolangVariableMap, Location, EntityQueryOptions, BlockLocation } from "mojang-minecraft"
import { randomInt, getPlayers } from './utility.js'

world.events.beforeChat.subscribe(data => {
    const message = data.message
    const dimension = world.getDimension(data.sender.dimension.id)

    switch (message) {
        case '!start':
            dimension.runCommand(`tag @a remove joined`)
            startWave(dimension, 1)
            break
        case '!removeProperties':
            world.setDynamicProperty("SpawnLocationData", "false")
            dimension.runCommand('say Removed Properties')
            break
        case '!properties':
            dimension.runCommand(`say ${world.getDynamicProperty("SpawnLocationData")}`)
            break
        default:
            break
    }

})

function startWave(dimension, round) {
    const total_zombies = 6 * round

    dimension.runCommand(`function expired`)
    dimension.runCommand(`title @a title §4Round ${round}`)
    dimension.runCommand(`tellraw @a {"rawtext":[{"text":"Zombies this round: §c${total_zombies}"}]}`)

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
            spawn_rate: randomInt(4, 9)
        }
    }

    let ticksPassed = 0
    let spawnsFinished = 0
    let endTicks = 0

    let spawnEnd = false
    let roundEndA = false
    let roundEndB = false
    let ended = false

    for (let spawnLocation in spawnLocations) {
        spawnLocation = spawnLocations[spawnLocation]
        spawnLocation.remaining_zombies = 0
        spawnLocation.remaining_zombies = total_zombies / 6
    }

    function spawnZombs() {
        const alivePlayers = getPlayers(false)

        if ((alivePlayers <= 0 || alivePlayers === undefined) && !ended) {
            dimension.runCommand(`tellraw @a {"rawtext":[{"text":"Game Over! You lasted ${round} rounds."}]}`)
            dimension.runCommand(`function fail`)

            world.events.tick.unsubscribe(spawnZombs)

            ended = true
            spawnEnd = true
            roundEndA = true
            roundEndB = true
        }

        if (!roundEndA) {
            checkZombs()
        }

        if (roundEndA && !roundEndB) {
            endTicks++
            if (endTicks === 600) {
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

            if (ticksPassed > 20) {

                for (let spawnLocation in spawnLocations) {
                    spawnLocation = spawnLocations[spawnLocation]
                    spawnLocation.current_second++
                }

                ticksPassed = 0
            }

            ticksPassed++

            for (let spawnLocation in spawnLocations) {
                spawnLocation = spawnLocations[spawnLocation]

                if (spawnLocation.current_second >= spawnLocation.spawn_rate) {
                    spawnLocation.current_second = 0

                    if (spawnLocation.remaining_zombies <= 0) {
                        spawnsFinished++

                        if (spawnsFinished >= 6) {
                            spawnEnd = true
                        }
                    } else {
                        let spawnLocationZ = new BlockLocation(spawnLocation.x, spawnLocation.y, spawnLocation.z)
                        spawnLocationZ = randomLocationOffset(spawnLocationZ, 3, 1, 3)

                        const zombie = dimension.spawnEntity("minecraft:zombie", spawnLocationZ)
                        dimension.spawnParticle("home:spawn_explosion_particle", zombie.location, new MolangVariableMap())

                        spawnLocation.remaining_zombies--
                        spawnLocation.spawn_rate = randomInt(3, 9)
                    }
                }
            }
        }
    }

    function checkZombs() {
        if (spawnEnd) {
            let monsterQuery = new EntityQueryOptions()
            monsterQuery.families = ['monster']

            if (Array.from(dimension.getEntities(monsterQuery)).length === 0) {
                endRound()
            }
        }
    }

    function endRound() {
        dimension.runCommand(`title @a title §eRound End`)

        roundEndA = true
    }

    /**
    * @param {BlockLocation} location
    * @param {number} offsetX
    * @param {number} offsetY
    * @param {number} offsetZ
    */
    function randomLocationOffset(location, offsetX, offsetY, offsetZ) {
        let newLocation = new BlockLocation(location.x, location.y, location.z)

        while (dimension.getBlock(newLocation).id !== "minecraft:air") {
            newLocation.x = location.x + Math.floor(Math.random() * (offsetX * 2 + 1) - offsetX)
            newLocation.y = location.y + Math.floor(Math.random() * (offsetY * 2 + 1) - offsetY)
            newLocation.z = location.z + Math.floor(Math.random() * (offsetZ * 2 + 1) - offsetZ)
        }

        return newLocation
    }

    world.events.tick.subscribe(() => spawnZombs())
}