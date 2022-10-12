import { world } from "mojang-minecraft"
import { getPlayers } from './utility.js'
import { startWave } from './round_handler.js'
import { restartLobby } from './lobby.js'

let playersReady = 0

world.events.beforeChat.subscribe(data => {
    const message = data.message
    const source = data.sender
    const dimension = world.getDimension(data.sender.dimension.id)

    switch (message) {
        case '!start':
            data.cancel = true
            if (!source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            startWave(dimension, 1)
            break
        case '!removeProperties':
            data.cancel = true
            if (!source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            world.setDynamicProperty("SpawnLocationData", "false")
            dimension.runCommand('say Removed Properties')
            break
        case '!properties':
            data.cancel = true
            if (!source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            dimension.runCommand(`say ${world.getDynamicProperty("SpawnLocationData")}`)
            break
        case '!end':
            data.cancel = true
            if (!source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            startWave(dimension, 1, true)
            break
        case '!ready':
            data.cancel = true

            if (!source.hasTag('lobby')) {
                dimension.runCommand('say The game has already begun!')
                break
            }

            if (source.hasTag('ready')) {
                dimension.runCommand('say You are already ready!')
                break
            }

            playersReady++

            source.addTag('ready')

            dimension.runCommand(`tellraw @a {"rawtext":[{"text":"§a${source.name} is Ready!"}]}`)

            if (playersReady === getPlayers(false)) {
                dimension.runCommand(`tellraw @a {"rawtext":[{"text":"§dEveryone is ready, game start!"}]}`)

                dimension.runCommand(`function remove_lobby`)
                playersReady = 0

                startWave(dimension, 1)
            }

            break
        case '!debug':
            data.cancel = true
            dimension.runCommand('say Debug mode enabled.')
            source.removeTag('lobby')
            source.addTag('debug')
            source.runCommand('function remove_lobby')
            break
        case '!lobby':
            data.cancel = true
            if (!source.hasTag('debug')) {
                dimension.runCommand('say Debug mode must be enabled for this.')
                break
            }

            for (const player of world.getPlayers()) {
                player.removeTag('debug')
                player.removeTag('joined')
            }

            restartLobby()

            break
        default:
            break
    }
})
