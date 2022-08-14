import { world } from 'mojang-minecraft'

world.events.entityHurt.subscribe(hurt => {
    const entity = hurt.hurtEntity
    const entityHealth = entity.getComponent('minecraft:health')
    const dimension = world.getDimension(entity.dimension.id)

    if (entity.id !== 'minecraft:zombie') return

    if (entityHealth.current <= 0) {
        const player = hurt.damagingEntity

        player.runCommand(`scoreboard players add @s killCount 1`)
        player.runCommand(`scoreboard players add @s money 45`)
    }
})