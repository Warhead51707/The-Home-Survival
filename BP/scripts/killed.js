import { world, Location } from 'mojang-minecraft'

world.events.entityHurt.subscribe(hurt => {
    const entity = hurt.hurtEntity
    const entityHealth = entity.getComponent('minecraft:health')
    const dimension = world.getDimension(entity.dimension.id)

    if (entityHealth.current <= 0) {
        switch (entity.id) {
            case "minecraft:zombie":
                const player = hurt.damagingEntity

                if (player == undefined) return;

                player.runCommand(`scoreboard players add @s killCount 1`)
                player.runCommand(`scoreboard players add @s money 45`)
                break
            default:
                break
        }
    }
})

world.events.tick.subscribe(death => {
    const players = world.getPlayers()

    for (let player of players) {
        const dimension = world.getDimension(player.dimension.id)
        const currentLocation = new Location(player.location.x, player.location.y + 1, player.location.z)
        const currentHeath = player.getComponent("health").current

        if (currentHeath > 0 || player.hasTag("dead")) return

        player.addTag("dead")

        const totem = dimension.spawnEntity("home:totem", currentLocation)
        totem.addTag(player.name)
        totem.nameTag = player.name
    }
})