event entity @e[family=monster] home:instant_despawn
kill @e[type=item]
kill @e[type=arrow]
kill @e[type=home:totem]

execute as @a run function reset_player
tag @a add lobby