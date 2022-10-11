clear @s
tag @s remove dead
effect @s clear
function clear_powerups
gamemode adventure
loot give @s loot start
scoreboard players set @s killCount 0
scoreboard players set @s money 250
tp -168 -60 37
xp -100l @s