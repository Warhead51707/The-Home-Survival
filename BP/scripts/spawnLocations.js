import { world, DynamicPropertiesDefinition } from 'mojang-minecraft'

world.events.worldInitialize.subscribe(data => {
    const properties = new DynamicPropertiesDefinition()
    properties.defineString("SpawnLocationData", 2000)

    data.propertyRegistry.registerWorldDynamicProperties(properties)
})