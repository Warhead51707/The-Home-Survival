import { world, SoundOptions, Location } from 'mojang-minecraft'
import { randomFloat } from './utility.js'

world.events.itemUseOn.subscribe(event => {
    
    const player = event.source
    const item = event.item
    const block = player.dimension.getBlock(event.blockLocation)

    if (block.id == "home:trash_can" && item.amount > 0) {

        let soundOptions = new SoundOptions()
        soundOptions.location = new Location(block.location.x, block.location.y, block.location.z)
        soundOptions.pitch = randomFloat(0.9, 1.2)
        soundOptions.volume = 1.0

        world.playSound("random.trash_item", soundOptions)
    }
})