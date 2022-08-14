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
    }
})