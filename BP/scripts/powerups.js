import { world, SoundOptions, MolangVariableMap, EntityQueryOptions, Color } from 'mojang-minecraft'
import { ActionFormData } from 'mojang-minecraft-ui'

let customers = {}
customers.tags = ['beacon_purchase']


//Powerup purchase detection
world.events.dataDrivenEntityTriggerEvent.subscribe(entityTriggerEvent => {
    if (entityTriggerEvent.id !== "home:purchase_powerup") return

    const vendor = entityTriggerEvent.entity
    const vendorName = vendor.nameTag === "" ? `entity.${vendor.id}.name` : vendor.nameTag

    for (let player of world.getPlayers(customers)) {
        player.removeTag("beacon_purchase")

        if (vendor.id === "home:speed_beacon") {
            const speedForm = new ActionFormData()

                .title(vendorName)
                .body("Get quick! Buy some Speed For U and increase your speed by 60 percent!")

                .button("Upgrade Speed ($1500)", "textures/ui/speed_effect")
                .button("Not Now")

            speedForm.show(player).then(formData => {
                if (formData.selection === 0) {
                    const purchaseOptions = {
                        particleColor: [124, 175, 198]
                    }

                    purchasePowerup(player, vendor, 1500, 'Speed For U', purchaseOptions)
                }
            })
        }

        if (vendor.id === "home:health_beacon") {
            let formOptions = ["upgrade_health"]
            const health = player.getComponent('minecraft:health')
            let healthForm
            const money = world.scoreboard.getObjective("money").getScore(player.scoreboard)
            let teammateQuery = {}
            teammateQuery.excludeNames = [player.name]
            const teammates = world.getPlayers(teammateQuery)

            let healthToHeal = Math.min(getMissingHealth(player), Math.floor(money / 50))

            let teammatesHealth = 0
            if (Array.from(teammates).length > 0) teammatesHealth = getMissingHealth(teammates, true)

            if (healthToHeal > 0) formOptions.unshift("heal")
            if (teammatesHealth > 0) formOptions.push("heal_teammates")

            if (!formOptions.includes("heal") && !formOptions.includes("heal_teammates")) {
                healthForm = new ActionFormData()

                    .title(vendorName)

                    .body("Stay up against those monsters! Buy some Health For U and double your maximum health!")

                    .button("Upgrade Health ($2000)", "textures/ui/health_boost_effect")
                    .button("Not Now")
            } else if (formOptions.includes("heal") && !formOptions.includes("heal_teammates")) {
                healthForm = new ActionFormData()

                    .title(vendorName)

                    .body("Stay up against those monsters! Buy some Health For U!")

                    .button(`Heal ${healthToHeal} (\$${healthToHeal * 50})`, "textures/ui/regeneration_effect")
                    .button("Upgrade ($2000)", "textures/ui/health_boost_effect")
                    .button("Not Now")
            } else if (!formOptions.includes("heal") && formOptions.includes("heal_teammates")) {
                healthForm = new ActionFormData()

                    .title(vendorName)

                    .body("Stay up against those monsters! Buy some Health For U!")

                    .button("Upgrade ($2000)", "textures/ui/health_boost_effect")
                    .button(`Heal Teammates (\$${teammatesHealth * 25})`, "textures/ui/absorption_effect")
                    .button("Not Now")
            } else if (formOptions.includes("heal") && formOptions.includes("heal_teammates")) {
                healthForm = new ActionFormData()

                    .title(vendorName)

                    .body("Stay up against those monsters! Buy some Health For U!")

                    .button(`Heal ${healthToHeal} (\$${healthToHeal * 50})`, "textures/ui/regeneration_effect")
                    .button("Upgrade ($2000)", "textures/ui/health_boost_effect")
                    .button(`Heal Teammates (\$${teammatesHealth * 25})`, "textures/ui/absorption_effect")
                    .button("Not Now")
            }

            healthForm.show(player).then(formData => {
                if (formOptions[formData.selection] === "upgrade_health") {
                    const purchaseOptions = {
                        particleColor: [248, 125, 35]
                    }
                    const purchaseSuccess = purchasePowerup(player, vendor, 2000, 'Health For U', purchaseOptions)

                    if (purchaseSuccess) {
                        health.setCurrent(40)
                    }
                } else if (formOptions[formData.selection] === "heal") {
                    healthToHeal = Math.min(getMissingHealth(player), Math.floor(money / 50))
                    const purchaseOptions = {
                        assignTag: false,
                        duplicateCondition: (healthToHeal <= 0),
                        duplicateMessage: 'You already have maximum health!',
                        particleColor: [248, 36, 35]
                    }
                    const purchaseSuccess = purchasePowerup(player, vendor, healthToHeal * 50, 'Health For U', purchaseOptions)

                    if (purchaseSuccess) {
                        health.setCurrent(health.current + healthToHeal)
                    }
                } else if (formOptions[formData.selection] === "heal_teammates") {
                    teammatesHealth = getMissingHealth(teammates, true)
                    const purchaseOptions = {
                        assignTag: false,
                        duplicateCondition: (teammatesHealth <= 0),
                        duplicateMessage: 'Your teammates already have maximum health!'
                    }
                    const purchaseSuccess = purchasePowerup(player, vendor, teammatesHealth * 25, 'Health For U', purchaseOptions)

                    if (purchaseSuccess) {
                        for (let teammate of teammates) {
                            teammate.getComponent('minecraft:health').resetToMaxValue()

                            mobSpellParticle(teammate, [248, 36, 35])
                        }
                    }
                }
            })
        }

        if (vendor.id === "home:weapons_for_u") {
            const weaponForm = new ActionFormData()

                .title(vendorName)

                .body("Fighting ain't nothin' without a good weapon. Get some Weapons For U!")

                .button("Buy Weapon ($850)", "textures/ui/strength_effect")
                .button("Not Now")

            weaponForm.show(player).then(formData => {
                if (formData.selection === 0) {
                    const purchaseOptions = {
                        particleColor: [147, 36, 35]
                    }

                    purchasePowerup(player, vendor, 850, 'Weapon For U', purchaseOptions)
                }
            })
        }
    }
})

/**
* @param {Player} player
* @param {Entity} vendor
* @param {number} cost
* @param {string} powerup
* @param {object} purchaseOptions
*/
function purchasePowerup(player, vendor, cost, powerup, purchaseOptions = {}) {
    const duplicateMessage = (purchaseOptions.duplicateMessage == undefined) ? 'You already have this!' : purchaseOptions.duplicateMessage
    const identifier = powerup.replace(/ /g, '')
    const ignoreTag = !(purchaseOptions.assignTag || purchaseOptions.assignTag == undefined)
    const money = world.scoreboard.getObjective("money").getScore(player.scoreboard)
    const vendorName = vendor.nameTag === "" ? `entity.${vendor.id}.name` : vendor.nameTag
    let soundOptions = new SoundOptions()
    soundOptions.location = vendor.location

    if (money < cost) {
        player.runCommand(`tellraw @s {"rawtext":[{"text":"["},{"translate":"${vendorName}"},{"text":"] You don\'t have enough for this!"}]}`)

        return false
    } else if ((player.hasTag(identifier.toLocaleLowerCase()) && !ignoreTag) || purchaseOptions.duplicateCondition) {
        player.runCommand(`tellraw @s {"rawtext":[{"text":"["},{"translate":"${vendorName}"},{"text":"] ${duplicateMessage}"}]}`)

        return false
    }

    player.runCommand(`tellraw @s {"rawtext":[{"text":"["},{"translate":"${vendorName}"},{"text":"] You successfully bought §6${powerup}§r!"}]}`)
    player.runCommand(`scoreboard players remove @s money ${cost}`)

    world.playSound("beacon.power", soundOptions)

    if (!ignoreTag) {
        player.addTag(identifier.toLocaleLowerCase())
    }

    if (purchaseOptions.particleColor !== undefined) {
        mobSpellParticle(player, purchaseOptions.particleColor)
    }

    return true
}

function getMissingHealth(iterator, isIterator = false) {
    let missingHealth = 0

    if (isIterator) {
        for (let player of iterator) {
            const maxHealth = player.getComponent('minecraft:health').value + player.hasTag("healthforu") * 20
            missingHealth += maxHealth - Math.ceil(player.getComponent('minecraft:health').current)
        }
    } else {
        const maxHealth = iterator.getComponent('minecraft:health').value + iterator.hasTag("healthforu") * 20
        missingHealth = maxHealth - Math.ceil(iterator.getComponent('minecraft:health').current)
    }

    return missingHealth
}

/**
* @param {Entity} entity
* @param {number[]} particleColors
*/
function mobSpellParticle(entity, particleColors) {
    const dimension = entity.dimension
    const particleColor = new Color(particleColors[0] / 255, particleColors[1] / 255, particleColors[2] / 255, 1)
    let particleVariableMap = new MolangVariableMap()
    particleVariableMap.setColorRGBA("variable.color", particleColor)

    dimension.spawnParticle("home:powerup_particle", entity.location, particleVariableMap)
}