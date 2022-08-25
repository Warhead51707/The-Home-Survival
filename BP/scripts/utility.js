import { MinecraftEnchantmentTypes, world } from 'mojang-minecraft'

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * @param {ItemStack} itemStack
 */
export function dealDurabilityDamage(itemStack) {
    const enchantments = itemStack.getComponent('minecraft:enchantments').enchantments
    const damageChance = 1 / (enchantments.hasEnchantment(MinecraftEnchantmentTypes.unbreaking) + 1)

    return Math.random() < damageChance
}

/**
 * @param {boolean} dead Should it return number of dead players?
 */
export function getPlayers(dead) {
    let chosenPlayers = 0

    for (let player of world.getPlayers()) {

        if (dead) {
            if (player.hasTag("dead")) {
                chosenPlayers++
                continue
            }
        }

        if (player.hasTag("dead")) continue

        chosenPlayers++
    }

    return chosenPlayers
}