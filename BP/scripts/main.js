import { world } from "mojang-minecraft"

import './properties.js'
import './round_handler.js'
import './set_location_item.js'
import './killed.js'
import './powerups.js'
import './weapon_durability.js'
import './totem.js'
import './katana.js'
import './turret.js'
import './trash_can.js'
import './commands.js'

import { createLobby } from './lobby.js'

world.events.worldInitialize.subscribe(event => {
    createLobby()
})