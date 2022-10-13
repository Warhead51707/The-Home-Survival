import { MinecraftEnchantmentTypes, world } from 'mojang-minecraft'

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomFloat(min, max) {
    return Math.random() * (max - min) + min
}

export function weightedRandom(options) {
    var i

    var weights = []

    for (i = 0; i < options.length; i++)
        weights[i] = options[i].weight + (weights[i - 1] || 0)

    var random = Math.random() * weights[weights.length - 1]

    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break

    return options[i]
}

export function dealDurabilityDamage(itemStack) {
    const enchantments = itemStack.getComponent('minecraft:enchantments').enchantments
    const damageChance = 1 / (enchantments.hasEnchantment(MinecraftEnchantmentTypes.unbreaking) + 1)

    return Math.random() < damageChance
}

export function getAlivePlayerCount() {
    let foundPlayers = 0

    for (let player of world.getPlayers()) {

        if (player.hasTag('dead')) continue

        foundPlayers++
    }

    return foundPlayers
}

export function getPlayerCount() {
    let foundPlayers = 0

    for (let player of world.getPlayers()) {
        foundPlayers++
    }

    return foundPlayers
}