scoreboard objectives add killCount dummy
scoreboard objectives setdisplay belowname money

execute as @a run titleraw @s actionbar {"rawtext":[{"text": "Kill Count: "},{"score":{"name":"@s","objective":"killCount"}}]}

scoreboard players set @a[tag=!joined] money 250
gamemode adventure @a[tag=!joined]
give @a[tag=!joined] wooden_sword
give @a[tag=!joined] bow
give @a[tag=!joined] arrow 32
tag @a[tag=!joined] add joined

effect @a saturation 1 1 true