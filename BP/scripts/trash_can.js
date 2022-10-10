import { world, SoundOptions, Location } from 'mojang-minecraft'

world.events.itemUseOn.subscribe(event => {
    
    const player = event.source
    const item = event.item
    const block = player.dimension.getBlock(event.blockLocation)

    if (block.id == "home:trash_can" && item.amount > 0) {

        let soundOptions = new SoundOptions()
        soundOptions.location = new Location(block.location.x, block.location.y, block.location.z)
        soundOptions.pitch = randomNextInt(0.9, 1.1)
        soundOptions.volume = 1.0

        world.playSound("random.trash_item", soundOptions)
    }

    function randomNextInt(min, max) {
        return Math.random() * (max - min) + min;
    }
})