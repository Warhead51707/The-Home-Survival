tag @a remove lobby
tag @a remove ready
kill @e[type=home:lobby_player]
gamerule showcoordinates true
gamerule sendcommandfeedback true
scoreboard objectives add money dummy
execute as @a run function reset_player