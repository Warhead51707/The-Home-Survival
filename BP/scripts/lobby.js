import { world, Location } from 'mojang-minecraft'
import { beginGame } from './round_handler.js'

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

let playersReady = 0
let playerCount = 0

let worldReady = false

let needsRerender = true

// tells lobby to rerender players
export function rerender() {
    needsRerender = true
}

// forces the game to start
export function allReady(player) {
    const dimension = player.dimension

    dimension.runCommand(`tellraw @a {"rawtext":[{"text":"§dEveryone is ready, game start!"}]}`)

    dimension.runCommand(`say removing lobby!`)
    dimension.runCommand(`function remove_lobby`)
    playersReady = 0

    beginGame()
}

/**
 * @remarks marks a player as ready
 * @param {player} player object to mark
 * */
export function playerReady(player) {
    const dimension = player.dimension

    // Will need to rewrite this later for a better check on if a game is inprogress
    if (!player.hasTag('lobby')) {
        dimension.runCommand('say The game has already begun!')

        return
    }

    if (player.hasTag('ready')) {
        dimension.runCommand('say You are already ready!')

        return
    }

    playersReady++

    player.addTag('ready')

    dimension.runCommand(`tellraw @a {"rawtext":[{"text":"§a${player.name} is Ready!"}]}`)

    if (playersReady == playerCount) {
        dimension.runCommand(`tellraw @a {"rawtext":[{"text":"§dEveryone is ready, game start!"}]}`)

        dimension.runCommand(`say removing lobby!`)
        dimension.runCommand(`function remove_lobby`)
        playersReady = 0

        beginGame()
    }
}

world.events.playerJoin.subscribe(event => {
    for (const slot of lobbySlots) {
        if (slot.owner != null) continue

        slot.owner = event.player.name

        needsRerender = true

        playerCount++

        break
    }
})

world.events.playerLeave.subscribe(event => {
    const slot = lobbySlots.find(s => s.owner == event.player.name)

    slot.owner = null
    if (slot.entity != null) slot.entity.triggerEvent('despawn')

    playerCount--
})

world.events.tick.subscribe(event => {
    const dimension = world.getDimension('overworld')

    // Prevent the players from spawning in if the world is not ready for spawning
    if (!worldReady) {
        try {
            dimension.runCommand('testfor @e')

            worldReady = true
        } catch { }
    }

    if (!worldReady) return

    // No reason to update if no players have joined, leaving is handled in the event not here
    if (!needsRerender) return

    // In case there is any entities left over from the last time
    for (const lobbyPlayer of dimension.getEntities({ type: 'home:lobby_player' })) {
        lobbyPlayer.triggerEvent('despawn')
    }

    let found = false

    // Render all the players
    for (const slot of lobbySlots) {
        if (slot.owner == null) continue

        slot.entity = dimension.spawnEntity('home:lobby_player', new Location(slot.coords.x + 0.5, slot.coords.y, slot.coords.z + 0.5))

        slot.entity.nameTag = slot.owner
        slot.entity.runCommand('tp @s ~ ~ ~ 270')

        found = true
    }

    needsRerender = false

    if (found) return

    // No players found must have reloaded mid game so rerender!
    for (const player of world.getPlayers()) {
        for (const slot of lobbySlots) {
            if (slot.owner != null) continue

            slot.owner = player.name

            needsRerender = true

            playerCount++

            break
        }
    }
})