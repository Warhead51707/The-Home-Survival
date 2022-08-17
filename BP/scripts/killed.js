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

let lastPosition = []
let totemPlaced = []

world.events.tick.subscribe(death => {
    const players = world.getPlayers()

    for (let player of players) {
        if (!player.hasTag("died") && totemPlaced.includes(player.name)) {
            const index = totemPlaced.indexOf(player.name)

            totemPlaced.splice(index, 1)
        }

        if (player.hasTag("died")) {
            if (totemPlaced.includes(player.name)) return

            const position = lastPosition.find(p => p.name === player.name).position

            const dimension = world.getDimension(player.dimension.id)
            const currentLocation = new Location(position.x, position.y + 1, position.z)

            player.addTag("dead")

            const totem = dimension.spawnEntity("home:totem", currentLocation)
            totem.addTag(player.name)
            totem.nameTag = player.name

            totemPlaced.push(player.name)
        }
    }

    for (let player of players) {
        if (player.hasTag("died")) continue

        if (lastPosition.find(p => p.name === player.name) === undefined) {
            lastPosition.push(
                {
                    name: player.name,
                    position: player.location
                }
            )

            continue
        }

        const index = lastPosition.findIndex(p => p.name === player.name)

        lastPosition.splice(index, 1, {
            name: player.name,
            position: player.location
        })

    }

})