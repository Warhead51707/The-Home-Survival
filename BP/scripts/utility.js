import { MinecraftEnchantmentTypes } from 'mojang-minecraft'

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