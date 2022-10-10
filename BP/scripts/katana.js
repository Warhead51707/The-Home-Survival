import { world, SoundOptions, MolangVariableMap, Location, EntityQueryOptions } from "mojang-minecraft"

world.events.entityHit.subscribe(entityHit => {
    const player = entityHit.entity

    if (player.id === "minecraft:player" && entityHit.hitEntity !== undefined) {
        const container = player.getComponent('minecraft:inventory').container
        const katana = container.getItem(player.selectedSlot)
        const target = entityHit.hitEntity

        if (katana !== undefined) {
            if (katana.id !== "home:katana" || player.velocity.length() >= 0.15 || !target.hasTag("mob_family"))
                return

            const dimension = target.dimension
            let sweepOptions = new SoundOptions()
            sweepOptions.location = player.location
            let sweepQuery = {}
            sweepQuery.families = ["mob"]
            sweepQuery.location = target.location
            sweepQuery.maxDistance = 1.5

            for (let sweepTarget of dimension.getEntities(sweepQuery)) {
                if (!sweepTarget.location.isNear(player.location, 3)) continue

                player.addTag("katana_sweep")
                sweepTarget.runCommand("damage @s 1 entity_attack entity @a[c=1,tag=katana_sweep]")
                player.removeTag("katana_sweep")
            }

            const sweepLocation = new Location(
                (player.location.x + target.location.x) / 2,
                (player.location.y + target.location.y) / 2,
                (player.location.z + target.location.z) / 2
            )

            dimension.spawnParticle("home:sweep_particle", sweepLocation, new MolangVariableMap())
            world.playSound("mob.player.attack.sweep", sweepOptions)

        }
    }
})