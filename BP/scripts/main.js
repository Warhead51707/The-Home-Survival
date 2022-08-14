import { world, BlockLocation, EntityQueryOptions, Location } from "mojang-minecraft"
import { randomInt } from './Utilities.js'

world.events.beforeChat.subscribe(data => {
    const message = data.message
    const dimension = world.getDimension(data.sender.dimension.id)

    if (message === "!start") {
        startWave(dimension, 1)

        data.cancel = true
    }
})

function startWave(dimension, round) {
    dimension.runCommand(`title @a title §4Round ${round}`)

    let spawnLocations = {
        spawn1: {
            x: -148,
            y: -60,
            z: 22,
            remaining_zombies: 0,
            current_second: 0,
            spawn_rate: 8
        },
        spawn2: {
            x: -147,
            y: -60,
            z: 51,
            remaining_zombies: 0,
            current_second: 0,
            spawn_rate: 5
        },
        spawn3: {
            x: -148,
            y: -55,
            z: 22,
            remaining_zombies: 0,
            current_second: 0,
            spawn_rate: 6
        },
        spawn4: {
            x: -145,
            y: -55,
            z: 37,
            remaining_zombies: 0,
            current_second: 0,
            spawn_rate: 7
        },
        spawn5: {
            x: -148,
            y: -55,
            z: 51,
            remaining_zombies: 0,
            current_second: 0,
            spawn_rate: 5
        },
        spawn6: {
            x: -172,
            y: -60,
            z: 51,
            remaining_zombies: 0,
            current_second: 0,
            spawn_rate: 9
        }
    }

    for (let spawnLocation in spawnLocations) {
        spawnLocation = spawnLocations[spawnLocation]
        spawnLocation.remaining_zombies = 0
    }

    let total_zombies = 6 * round

    for (let spawnLocation in spawnLocations) {
        spawnLocation = spawnLocations[spawnLocation]
        spawnLocation.remaining_zombies = total_zombies / 6
    }

    let ticksPassed = 0
    let spawnsFinished = 0
    let endTicks = 0

    let spawnEnd = false
    let roundEndA = false
    let roundEndB = false
    let ended = false

    function spawnZombs() {
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

                        continue
                    }

                    const spawnLocationZ = new BlockLocation(spawnLocation.x, spawnLocation.y, spawnLocation.z)

                    dimension.spawnEntity("zombie", spawnLocationZ)

                    spawnLocation.remaining_zombies--
                    spawnLocation.spawn_rate = randomInt(3, 9)
                }
            }
        }
    }

    function checkZombs() {

        if (spawnEnd) {
            try {
                const zombies = dimension.runCommand('testfor @e[type=zombie]')

                if (zombies.victim.length === 0) {
                    throw "EEEE"
                }
            } catch (err) {
                endRound()
            }
        }


    }

    function endRound() {
        dimension.runCommand(`title @a title §eRound End`)

        roundEndA = true
    }

    world.events.tick.subscribe(() => spawnZombs())
}