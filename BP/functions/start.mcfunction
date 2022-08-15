scoreboard objectives add killCount dummy
scoreboard objectives add money dummy Money
scoreboard objectives setdisplay sidebar money

scoreboard objectives setdisplay belowname money

execute as @a run titleraw @s actionbar {"rawtext":[{"text": "Kill Count: "},{"score":{"name":"@s","objective":"killCount"}}]}

scoreboard players set @a[tag=!joined] money 250
scoreboard players set @a[tag=!joined] killCount 0
tp @a[tag=!joined] -168 -60 37
xp -100l @a[tag=!joined]
gamemode adventure @a[tag=!joined]
loot give @a[tag=!joined] loot start
tag @a[tag=!joined] remove speedforu
tag @a[tag=!joined] remove healthforu
tag @a[tag=!joined] add joined

effect @a saturation 1 1 true