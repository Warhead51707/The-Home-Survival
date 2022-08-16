import { world, MolangVariableMap, EntityQueryOptions } from "mojang-minecraft"

world.events.tick.subscribe(() => {
    const dimension = world.getDimension('overworld')

    const totemQuery = new EntityQueryOptions()
    totemQuery.type = 'home:totem'

    for (let totem of dimension.getEntities(totemQuery)) {
        let playerName = null

        for (let tag of totem.getTags()) {
            if (tag === "interacted" || tag === "expired") continue

            playerName = tag
        }

        if (totem.hasTag("expired")) {
            for (let player of world.getPlayers()) {
                if (player.name !== playerName) return

                player.addTag("expired")
            }
        }

        if (!totem.hasTag("interacted")) return

        const totemLocation = totem.location


        for (let player of world.getPlayers()) {
            if (player.name !== playerName) continue

            player.removeTag("dead")
            dimension.runCommand(`gamemode a ${playerName}`)
            dimension.runCommand(`tp ${playerName} ${totemLocation.x} ${totemLocation.y} ${totemLocation.z}`)

            dimension.spawnParticle("minecraft:totem_particle", totem.location, new MolangVariableMap())
            player.playSound("random.totem")
        }

        totem.triggerEvent("home:despawn")
    }
})