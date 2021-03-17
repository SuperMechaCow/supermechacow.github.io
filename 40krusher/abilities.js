const ABILITIES = [{
		check: abilityText.includes('When the bearer fights, it makes 1 additional attack with this weapon.'),
		abilObj: {
			name: '+1A',
			description: 'When the bearer fights, it makes 1 additional attack with this weapon.',
			effect: function() {
				attackerA_box.value++;
			}
		}
	},
	{
		check: abilityText.includes('Blast.'),
		abilObj: {
			name: 'Blast',
			description: 'Blast Weapons: Minimum three attacks against units with 6+ models. Always make maximum number of attacks against units with 11+ models. Can never be used to attack units within the firing unit’s Engagement Range.',
			effect: function() {
				//blast effects here.
			}
		}
	}

]
