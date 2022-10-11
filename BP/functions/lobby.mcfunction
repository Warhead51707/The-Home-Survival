gamemode spectator @a[tag=lobby]
execute as @a[tag=lobby] run gamerule showcoordinates false
execute as @a[tag=lobby] run gamerule sendcommandfeedback false
execute as @a[tag=lobby] run scoreboard objectives remove money
effect @a[tag=lobby] invisibility 1 11 true
tp @a[tag=lobby] -136 -33 37 facing @e[type=home:floating_lobby_text]