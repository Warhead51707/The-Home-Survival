import { world, Location, BlockLocation } from "mojang-minecraft"

let worldLobby

let worldReady = false

let lobbySlots = [
    {
        owner: null,
        coords: {
            x: -142,
            y: -34,
            z: 40
        },
        entity: null
    },
    {
        owner: null,
        coords: {
            x: -143,
            y: -34,
            z: 38
        },
        entity: null
    },
    {
        owner: null,
        coords: {
            x: -142,
            y: -34,
            z: 36
        },
        entity: null
    },
    {
        owner: null,
        coords: {
            x: -143,
            y: -34,
            z: 34
        },
        entity: null
    },
    {
        owner: null,
        coords: {
            x: -145,
            y: -34,
            z: 35
        },
        entity: null
    },
    {
        owner: null,
        coords: {
            x: -145,
            y: -34,
            z: 39
        },
        entity: null
    }
]

let needsRerender = false

export function createLobby() {
    worldLobby = new Lobby()
}

class Lobby {
    constructor() {
        world.events.playerJoin.subscribe(event => {
            for (const slot of lobbySlots) {
                if (slot.owner != null) continue

                slot.owner = event.player.name

                needsRerender = true

                break
            }
        })

        world.events.playerLeave.subscribe(event => {
            const slot = lobbySlots.find(s => s.owner == event.player.name)

            slot.owner = null
            if (slot.entity != null) slot.entity.triggerEvent('despawn')
        })

        world.events.tick.subscribe(event => {
            const dimension = world.getDimension('overworld')

            // Prevent the players from spawning in if the world is not ready for spawning
            if (!worldReady) {
                try {
                    dimension.runCommand('testfor @e')

                    worldReady = true

                    console.warn('World Ready!')
                } catch { }
            }

            if (!worldReady) return

            // No reason to update if no players have joined, leaving is handled in the event not here
            if (!needsRerender) return

            // In case there is any entities left over from the last time
            for (const lobbyPlayer of dimension.getEntities({ type: 'home:lobby_player' })) {
                lobbyPlayer.triggerEvent('despawn')
            }

            // Render all the players
            for (const slot of lobbySlots) {
                if (slot.owner == null) continue

                slot.entity = dimension.spawnEntity('home:lobby_player', new Location(slot.coords.x + 0.5, slot.coords.y, slot.coords.z + 0.5))

                slot.entity.nameTag = slot.owner
                slot.entity.runCommand('tp @s ~ ~ ~ 270')
            }

            needsRerender = false
        })
    }
}