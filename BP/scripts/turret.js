import { world, ItemStack, Items } from 'mojang-minecraft'

world.events.tick.subscribe(event => {

    const entities = world.getDimension("overworld").getEntities()

    for (const turret of entities) {
        if (turret.id != "home:turret") continue

        const container = turret.getComponent("inventory").container
        

        let hasAmmunition = false;
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);

            if (!item) continue;
            
            if (item.id == "minecraft:arrow") {
                hasAmmunition = true
                break;
            }
        }
        if (hasAmmunition) {
            if (!turret.hasTag("has_ammunition")) {
                turret.triggerEvent("add_shooter")
                turret.addTag("has_ammunition")
            }
        } else {
            if (turret.hasTag("has_ammunition")) {
                turret.triggerEvent("remove_shooter")
                turret.removeTag("has_ammunition")
            }
        }
    }
})

world.events.dataDrivenEntityTriggerEvent.subscribe(event => {
    const entities = world.getDimension("overworld").getEntities()

    if (event.id == "on_shoot") {
        for (const turret of entities) {
            if (turret.id != "home:turret") continue

            const container = turret.getComponent("inventory").container

            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);

                if (!item) continue;
                
                if (item.id == "minecraft:arrow") {
                    const items = Items.get(item.id)
                    const arrow = new ItemStack(items, item.amount - 1, item.data)
                    container.setItem(i, arrow)
                    break
                }
            }
        }
    }
})