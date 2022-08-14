import { world } from 'mojang-minecraft'

world.events.beforeItemUseOn.subscribe(use => {
    const item = use.item
    const location = use.blockLocation
    const player = use.source
    const dimension = world.getDimension(player.dimension.id)

    if (item.id !== 'home:set_spawn_location') return

    const locationProperty = world.getDynamicProperty("SpawnLocationData")

    const locationData = {
        x: location.x,
        y: location.y + 2,
        z: location.z
    }

    dimension.runCommand(`particle home:set_location ${location.x} ${location.y + 0.8} ${location.z}`)
    dimension.runCommand(`say Location set at ${location.x} ${location.y} ${location.z}`)

    if (locationProperty === undefined || locationProperty === "false") {
        world.setDynamicProperty("SpawnLocationData", JSON.stringify({ spawn1: locationData }))
        return
    }

    const locationObject = JSON.parse(locationProperty)

    locationObject[`spawn${Object.keys(locationObject).length + 1}`] = locationData
    world.setDynamicProperty("SpawnLocationData", JSON.stringify(locationObject))

})