event entity @e[family=monster] home:instant_despawn
event entity @e[family=inanimate] home:instant_despawn
kill @e[type=item]
kill @e[type=arrow]

execute as @a run function reset_player
tag @a add lobby