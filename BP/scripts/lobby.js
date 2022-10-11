import { world, Location } from "mojang-minecraft"

let restart = false

let lobbySlots = [
    {
        owner: null,
        coords: {
            x: -142,
            y: -34,
            z: 40
        }
    },
    {
        owner: null,
        coords: {
            x: -143,
            y: -34,
            z: 38
        }
    },
    {
        owner: null,
        coords: {
            x: -142,
            y: -34,
            z: 36
        }
    },
    {
        owner: null,
        coords: {
            x: -143,
            y: -34,
            z: 34
        }
    },
    {
        owner: null,
        coords: {
            x: -145,
            y: -34,
            z: 35
        }
    },
    {
        owner: null,
        coords: {
            x: -145,
            y: -34,
            z: 39
        }
    }
]

world.events.tick.subscribe(tick => {
    const players = world.getPlayers()



    for (const player of players) {
        const dimension = world.getDimension(player.dimension.id)

        if (restart) {
            for (const slot of lobbySlots) {
                slot.owner = null
            }

            const lobbyPlayers = dimension.getEntities(
                {
                    type: "home:lobby_player"
                }
            )

            for (const lobbyPlayer of lobbyPlayers) {
                lobbyPlayer.triggerEvent('despawn')
            }

            restart = false
        }

        const slotData = lobbySlots.find(slot => slot.owner === player.name)

        if (slotData !== undefined) continue

        let openSlot

        for (const slot of lobbySlots) {
            if (slot.owner !== null) continue

            openSlot = lobbySlots.findIndex(s => s === slot)
            break
        }

        lobbySlots[openSlot].owner = player.name

        const spawnLocation = new Location(lobbySlots[openSlot].coords.x, lobbySlots[openSlot].coords.y, lobbySlots[openSlot].coords.z)

        let lobbyPlayer = dimension.spawnEntity("home:lobby_player", spawnLocation)
        lobbyPlayer.nameTag = player.name
        lobbyPlayer.runCommand("tp @s ~ ~ ~ 270")
        lobbyPlayer.runCommand(`tp @s ${lobbySlots[openSlot].coords.x} ${lobbySlots[openSlot].coords.y} ${lobbySlots[openSlot].coords.z}`)
    }
})

world.events.playerLeave.subscribe(leave => {
    restart = true
})

export function restartLobby() {
    restart = true
}