import { world } from 'mojang-minecraft'

import {
    ActionFormData,
    MessageFormData,
    ModalFormData
} from "mojang-minecraft-ui"

world.events.tick.subscribe(tick => {
    const players = world.getPlayers()

    for (let player of players) {
        const dimension = world.getDimension(player.dimension.id)

        if (player.hasTag("speedbuy")) {
            player.removeTag("speedbuy")

            const speedForm = new MessageFormData()

                .title("Speed For U")

                .body("Get Quick! Buy some Speed For U!")

                .button1("Buy ($2500)")

                .button2("Not Now")

            speedForm.show(player).then(formData => {
                if (formData.selection === 1) {
                    player.runCommand('function speed_for_u')
                }
            })
        }

        //900 heal, 1800 if health upgrade
        //3500 health upgrade

        if (player.hasTag("healthbuy")) {
            player.removeTag("healthbuy")

            const cost = player.hasTag('healthforu') ? 1800 : 900

            const healthForm = new MessageFormData()

                .title("Health For U")

                .body("Get Quick! Buy some Health For U!")

                .button1(`Heal (\$${cost})`)

                .button2("Upgrade ($3500)")

            healthForm.show(player).then(formData => {
                const money = world.scoreboard.getObjective('money').getScore(player.scoreboard)

                if (formData.selection === 1) {
                    if (money < cost) {
                        player.runCommand(`tellraw @s {"rawtext":[{"text":"[HealthForU] You don't have enough for this!"}]}`)

                        return
                    }

                    player.runCommand(`tellraw @s {"rawtext":[{"text":"[HealthForU] You successfully bought §6Health For U!"}]}`)

                    player.runCommand(`scoreboard players remove @s money ${cost}`)

                    player.runCommand(`effect @s instant_health 1 255`)
                } else if (formData.selection === 0) {
                    if (money < 3500) {
                        player.runCommand(`tellraw @s {"rawtext":[{"text":"[HealthForU] You don't have enough for this!"}]}`)

                        return
                    }

                    player.runCommand(`tellraw @s {"rawtext":[{"text":"[HealthForU] You successfully bought §6Health For U!"}]}`)

                    player.runCommand(`scoreboard players remove @s money 3500`)

                    player.runCommand(`tag @s add healthforu`)
                }
            })
        }
    }
})