import { world, SoundOptions, MinecraftItemTypes, ItemStack } from 'mojang-minecraft'
import { dealDurabilityDamage } from './utility.js'

const durabilityItems = []

world.events.entityHit.subscribe(entityHit => {
    const player = entityHit.entity

    if (player.id == 'minecraft:player' && entityHit.hitEntity != undefined) {
        let container = player.getComponent('minecraft:inventory').container
        let weapon = container.getItem(player.selectedSlot)

        if (weapon != undefined) {
            if (durabilityItems.includes(weapon.id.slice(5))) {
                if (dealDurabilityDamage(weapon)) {
                    weapon.getComponent('minecraft:durability').damage++
                }

                if (weapon.getComponent('minecraft:durability').damage >= weapon.getComponent('minecraft:durability').maxDurability) {
                    const air = new ItemStack(MinecraftItemTypes.air)
                    let breakOptions = new SoundOptions()
                    breakOptions.location = player.location

                    container.setItem(player.selectedSlot, air)
                    world.playSound('random.break', breakOptions)
                } else {
                    container.setItem(player.selectedSlot, weapon)
                }
            }
        }
    }
})