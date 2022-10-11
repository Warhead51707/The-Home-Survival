import { world, SoundOptions, Items, MinecraftEnchantmentTypes, ItemStack } from 'mojang-minecraft'

const durabilityItems = ['katana']

world.events.entityHit.subscribe(entityHit => {
    const player = entityHit.entity

    if (player.id == "minecraft:player" && entityHit.hitEntity != undefined) {
        let container = player.getComponent('minecraft:inventory').container
        let weapon = container.getItem(player.selectedSlot)

        if (weapon != undefined && entityHit.hitEntity.hasTag("mob_family")) {
            if (durabilityItems.includes(weapon.id.slice(5))) {
                if (dealDurabilityDamage(weapon)) {
                    weapon.getComponent("minecraft:durability").damage++
                }

                if (weapon.getComponent("minecraft:durability").damage >= weapon.getComponent("minecraft:durability").maxDurability) {
                    const air = new ItemStack(Items.get("minecraft:paper"), 0, 0)
                    let breakOptions = new SoundOptions()
                    breakOptions.location = player.location

                    container.setItem(player.selectedSlot, air)
                    world.playSound("random.break", breakOptions)
                } else {
                    container.setItem(player.selectedSlot, weapon)
                }
            }
        }
    }
})

/**
* @param {ItemStack} itemStack
*/
export function dealDurabilityDamage(itemStack) {
    const enchantments = itemStack.getComponent('minecraft:enchantments').enchantments
    const damageChance = 1 / (enchantments.hasEnchantment(MinecraftEnchantmentTypes.unbreaking) + 1)

    return Math.random() < damageChance
}