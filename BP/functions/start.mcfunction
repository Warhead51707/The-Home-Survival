scoreboard objectives add killCount dummy "Kill Count"
scoreboard objectives add money dummy Money
scoreboard objectives setdisplay belowname money
scoreboard objectives setdisplay list killCount
scoreboard objectives setdisplay sidebar money

execute as @a[tag=!joined] run function reset_player
tag @a[tag=!joined] add joined

effect @a saturation 1 1 true