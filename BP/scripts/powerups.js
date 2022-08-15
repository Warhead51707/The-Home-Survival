import { world, SoundOptions, MolangVariableMap, Color } from 'mojang-minecraft'
import { ActionFormData } from 'mojang-minecraft-ui'

world.events.tick.subscribe(tick => {
    const players = world.getPlayers()

    for (let player of players) {
        if (player.hasTag("speedbuy")) {
            player.removeTag("speedbuy")

            const speedForm = new ActionFormData()

                .title("Speed For U")
                .body("Get quick! Buy some Speed For U!")

                .button("Buy ($2500)")
                .button("Not Now")

            speedForm.show(player).then(formData => {
                if (formData.selection === 0) {
                    const purchaseOptions = {
                        particleColor: [124, 175, 198]
                    }

                    purchasePowerup(player, 2500, 'Speed For U', purchaseOptions)
                }
            })
        }

        //900 heal, 1800 if health upgrade
        //3500 health upgrade

        if (player.hasTag("healthbuy")) {
            player.removeTag("healthbuy")

            const cost = player.hasTag('healthforu') ? 1800 : 900
            const health = player.getComponent('minecraft:health')

            const healthForm = new ActionFormData()

                .title("Health For U")

                .body("Stay up against those monsters! Buy some Health For U!")

                .button(`Heal (\$${cost})`)
                .button("Upgrade ($3500)")
                .button("Not Now")

            healthForm.show(player).then(formData => {
                if (formData.selection === 0) {
                    const purchaseOptions = {
                        assignTag: false,
                        duplicateCondition: (Math.ceil(health.current) >= health.value + player.hasTag("healthforu") * 20),
                        duplicateMessage: 'You already have maximum health!',
                        particleColor: [248, 36, 35]
                    }
                    const purchaseSuccess = purchasePowerup(player, cost, 'Health For U', purchaseOptions)

                    if (purchaseSuccess) {
                        health.resetToMaxValue()
                    }
                } else if (formData.selection === 1) {
                    const purchaseOptions = {
                        particleColor: [248, 125, 35]
                    }
                    const purchaseSuccess = purchasePowerup(player, 3500, 'Health For U', purchaseOptions)

                    if (purchaseSuccess) {
                        health.setCurrent(40)
                    }
                }
            })
        }
    }
})

/**
* @param {Player} player
* @param {number} cost
* @param {string} powerup
* @param {object} purchaseOptions
*/
function purchasePowerup(player, cost, powerup, purchaseOptions = {}) {
    const dimension = player.dimension
    const duplicateMessage = (purchaseOptions.duplicateMessage == undefined) ? 'You already have this!' : purchaseOptions.duplicateMessage
    const identifier = powerup.replace(/ /g, '')
    const ignoreTag = !(purchaseOptions.assignTag || purchaseOptions.assignTag == undefined)
    const money = world.scoreboard.getObjective('money').getScore(player.scoreboard)
    let soundOptions = new SoundOptions()
    soundOptions.location = player.location

    if (money < cost) {
        player.runCommand(`tellraw @s {"rawtext":[{"text":"[${identifier}] You don\'t have enough for this!"}]}`)

        return false
    } else if ((player.hasTag(identifier.toLocaleLowerCase()) && !ignoreTag) || purchaseOptions.duplicateCondition) {
        player.runCommand(`tellraw @s {"rawtext":[{"text":"[${identifier}] ${duplicateMessage}"}]}`)

        return false
    }

    player.runCommand(`tellraw @s {"rawtext":[{"text":"[${identifier}] You successfully bought §6${powerup}§r!"}]}`)
    player.runCommand(`scoreboard players remove @s money ${cost}`)

    player.playSound("beacon.power", soundOptions)

    if (!ignoreTag) {
        player.addTag(identifier.toLocaleLowerCase())
    }

    if (purchaseOptions.particleColor != undefined) {
        const particleColor = new Color(purchaseOptions.particleColor[0] / 255, purchaseOptions.particleColor[1] / 255, purchaseOptions.particleColor[2] / 255, 1)
        let particleVariableMap = new MolangVariableMap()
        particleVariableMap.setColorRGBA("variable.color", particleColor)

        dimension.spawnParticle("home:powerup_particle", player.location, particleVariableMap)
    }

    return true
}