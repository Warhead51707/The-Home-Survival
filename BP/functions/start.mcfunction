scoreboard objectives add killCount dummy "Kill Count"
scoreboard objectives add money dummy Money
scoreboard objectives setdisplay belowname money
scoreboard objectives setdisplay list killCount
scoreboard objectives setdisplay sidebar money

execute as @a[tag=!joined] run tag @s add lobby
tag @a[tag=!joined] add joined

effect @a saturation 1 1 true