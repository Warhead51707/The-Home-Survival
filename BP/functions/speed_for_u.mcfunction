tellraw @s[tag=speedforu] {"rawtext":[{"text":"[SpeedForU] You already have this!"}]}

tellraw @s[scores={money=0..2499},tag=!speedforu] {"rawtext":[{"text":"[SpeedForU] You don't have enough for this!"}]}

tag @s[scores={money=2500..100000},tag=!speedforu] add speedforu

tellraw @s[scores={money=2500..100000},tag=!speedforu] {"rawtext":[{"text":"[SpeedForU] You successfully bought §6Speed For U!"}]}

scoreboard players remove @s[scores={money=2500..100000},tag=!speedforu] money 2500