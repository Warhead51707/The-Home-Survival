import { weightedRandom } from './utility.js'

const spawnPool = [
    {
        "identifier": "minecraft:zombie",
        "min": 1,
        "weight": 75
    },
    {
        "identifier": "minecraft:skeleton",
        "min": 10,
        "weight": 25
    }
]

/**
 * @remarks Returns a mob to spawn in (reads spawn_pool.js)
 */
export function randomMonster(round) {
    let spawnGroup = []

    for (const spawn of spawnPool) {
        if (round < spawn.min || round > spawn.max) continue

        spawnGroup.push(spawn)
    }

    const weightedPick = weightedRandom(spawnGroup)

    return weightedPick.identifier
}