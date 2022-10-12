import { world, MolangVariableMap } from "mojang-minecraft"


//Handles Totem summoning and Totem activation and Totem expiration 
world.events.dataDrivenEntityTriggerEvent.subscribe(entityTriggerEvent => {
    const totem = entityTriggerEvent.entity

    if (entityTriggerEvent.id === "home:totem_expired") {
        let playerName

        for (let tag of totem.getTags()) {
            playerName = tag
        }

        for (let player of world.getPlayers()) {
            if (player.name !== playerName) return


            player.addTag("expired")
        }
        totem.dimension.spawnParticle("minecraft:egg_destroy_emitter", totem.location, new MolangVariableMap())
        totem.triggerEvent("home:instant_despawn")
    }

    if (entityTriggerEvent.id === "home:respawn_player") {
        const dimension = world.getDimension('overworld')
        let playerName

        for (let tag of totem.getTags()) {
            playerName = tag
        }

        for (let player of world.getPlayers()) {
            if (player.name !== playerName) continue

            player.removeTag("dead")
            player.runCommand('gamemode adventure')
            player.runCommand(`tp ${totem.location.x} ${totem.location.y} ${totem.location.z}`)

            dimension.spawnParticle("minecraft:totem_particle", totem.location, new MolangVariableMap())
            player.playSound("random.totem")
        }

        totem.triggerEvent("home:instant_despawn")
    }
})