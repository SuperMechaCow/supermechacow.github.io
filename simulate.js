var debug = false;

var iterations = 1;

var active_army = 0;

function flipArmy() {
	getBoxes();
	if (!active_army) {
		defenderName_box.innerHTML = "&gt; " + defenderName_box.innerHTML + " &lt;";
		attackerName_box.innerHTML = attackerName_box.innerHTML.replace(/(&gt;)|(&lt;)/g, '');
		active_army = 1;
	} else {
		attackerName_box.innerHTML = "&gt; " + attackerName_box.innerHTML + " &lt;";
		defenderName_box.innerHTML = defenderName_box.innerHTML.replace(/(&gt;)|(&lt;)/g, '');
		active_army = 0;
	}
}

function setit(battles) {
	iterations = battles;
}

function roll(multi = 1, denom = 6, mod = 0) {
	let result = 0;
	for (let rolls = 0; rolls < multi; rolls++) {

		result += Math.ceil(Math.random() * denom);
	}
	result += mod;
	return result;
}

function check(result, against, higher = true) {
	if (higher) return result >= against
	else return result <= against

}

function tickle() {
	$('#modbox').accordion('option', 'active', false);
}

function krunchit() {
	getBoxes();
	let total_hits = 0;
	let total_hitreroll = 0;
	let total_autohits = 0;
	let total_autowounds = 0;
	let total_woundreroll = 0;
	let total_wounds = 0;
	let total_apwounds = 0;
	let total_mortals = 0;
	let total_saves = 0;
	let total_invulns = 0;
	let total_ignored = 0;
	let total_damage = 0;
	let total_effdamage = 0;
	let total_shielded = 0;
	let total_modelsKilled = 0;
	let total_unfelt = 0;
	let total_epda = 0;
	let total_attacksMade = 0;
	let total_bonusAttack = 0;
	let total_squadwipe = 0;
	let total_foughtback = 0;
	let total_reanimated = 0;

	let modelHP = defenderW;

	//
	// Simulations
	//

	for (let iterate = 0; iterate < iterations; iterate++) {

		//
		// Models
		//

		let modelsToRean = 0;
		for (let model_i = 0; model_i < attackerModels; model_i++) {

			//
			// HITS
			//

			let attacks = 0;
			let attacksMade = 0;
			let bonusAttack = 0;
			let hits = 0;
			let autohits = 0;
			let hitreroll = 0;
			let wounds = 0;
			let autowounds = 0;
			// If random attacks are specified in the Hits tab
			if (randomAttacks || attackerA == 0) attacks += roll(randomAttacksDice, randomAttacksDenom, randomAttacksMod);
			// Otherwise use the A stat
			else attacks = attackerA;
			// All flamers hit without rolling
			if (flamer) {
				hits += attacks;
			} else {
				// Loop for every model's attacks
				for (let attack_i = 0; attack_i < attacks + bonusAttack; attack_i++) {
					// Increase attacks made tally
					attacksMade++;
					//Make the roll
					let result = roll(1, 6, hitMod);
					// If lower than reroll hit mod and NOT enough to score anyways
					if (check(result, rerollHITagainst, false) && !check(result, attackerAS)) {
						//Reroll now
						result = roll(1, 6, hitMod);
						// Increase reroll tally
						hitreroll++;
					}
					// Check for attacks on 6's, but not on bonus attacks
					if (exploding6s && check(result, 6) && attack_i < attacks) {
						bonusAttack++;
					} // Check for extra hits on 6's
					if (extrahit6 && check(result, 6)) {
						hits++;
						autohits++;
					}
					// Check for auto-wounding on 6's
					if (autowound6s && check(result, 6)) {
						wounds++;
						autowounds++;
					} else { // If it didn't auto-wound, make the roll
						hits += Number(check(result, attackerAS));
					}
				} //Hits end
			} //Flamer end
			total_attacksMade += attacksMade;
			total_hits += hits;
			total_bonusAttack += bonusAttack;
			total_hitreroll += hitreroll;
			total_autohits += autohits;
			total_autowounds += autowounds;


			//
			// WOUNDS
			//

			let woundreroll = 0;
			let mortals = 0;
			let apwounds = 0;
			let ignored = 0;
			for (let hits_i = 0; hits_i < hits; hits_i++) {
				let result = roll(1, 6, wMod);
				// Was it low enough to re-roll?
				if (check(result, rerollWDagainst, false)) {
					result = roll(1, 6, wMod);
					woundreroll++;
				}
				if (mortalson6s && check(result, 6)) {
					mortals++;
				}
				if (apon6s && check(result, 6)) {
					apwounds++;
				} else {
					//Calculate what the target is for wounding
					let against = 0;
					if (attackerS / 2 >= defenderT) against = 2;
					else if (attackerS > defenderT) against = 3;
					else if (attackerS == defenderT) against = 4;
					else if (attackerS > defenderT / 2) against = 5;
					else against = 6;
					//If the roll was below the ignore amount and the wound roll could have been made
					if (check(result, ignorebelowamount, false) && ignorebelowamount >= against) ignored++;
					//Otherwise, make a normal wound roll
					else wounds += Number(check(result, against))
				}
			} // Wounds end
			total_wounds += wounds;
			total_apwounds += apwounds;
			total_woundreroll += woundreroll;
			total_mortals += mortals;
			total_ignored += ignored;



			//
			// Saves
			//

			let saves = 0;
			let invulns = 0;
			for (let wounds_i = 0; wounds_i < wounds + apwounds; wounds_i++) {
				// Make one save roll
				let result = roll();
				let against = 0;
				let basicsave;
				if (wounds_i < wounds) basicsave = defenderSv + attackerAP;
				else basicsave = defenderSv + attackerAP + apo6amount;
				// A 1 on a save is always a fail
				if (result != 1) {
					if (basicsave > defenderInv && invuln) invulns += Number(check(result, defenderInv));
					else saves += Number(check(result, basicsave));
				}
			} // Saves end
			total_saves += saves;
			total_invulns += invulns;



			//
			// Damage
			//

			let shielded = 0;
			let damage = 0;
			let effdamage = 0;
			let unfelt = 0;
			let modelsKilled = 0;
			let squadwipe = 0;
			let foughtback = 0;
			for (let unsaved_i = 0; unsaved_i < wounds - saves; unsaved_i++) {
				let result;
				// If there's a random amount of Damage
				if (!attackerDmulti) result = attackerDdenom + attackerDmod;
				else result = roll(attackerDmulti, attackerDdenom, attackerDmod);
				// Shielding
				if (flatDR) {
					if (result - flatDR > 1) {
						result = result - flatDR;
						shielded -= flatDR - result;
					} else {
						result = 1;
					}
				}
				// Add to total damage and effective damage
				damage += result;
				effdamage += result;
				// Check each point of damage for FNP
				for (let damage_i = 0; damage_i < result; damage_i++) {
					if (fnp && check(roll(), defenderFNP)) {
						effdamage--;
						unfelt++;
					} else {
						// Hurt the model
						modelHP--;
						// If the model is dead
						if (modelHP <= 0) {
							modelsKilled++;
							// Can they fight back on death?
							if (fightback) foughtback += check(roll(), fightbackagainst);
							// If a number of models was given, have we killed enough of them?
							if (defenderModels) squadwipe = Math.floor(modelsKilled / defenderModels);
							// Reset model HP
							modelHP = defenderW;
							// Subtract remaining damage from effective damage
							effdamage -= result - (damage_i + 1)
							//Stop counting the damage from this damage roll. It doesn't carry over
							break;
						}
					}
				}


			} // Damage end

			total_shielded += shielded;
			total_damage += damage;
			total_effdamage += effdamage;
			total_unfelt += unfelt;
			total_modelsKilled += modelsKilled;
			modelsToRean += modelsKilled;
			total_squadwipe += squadwipe;
			total_foughtback += foughtback;

		} // Models end

		let reanimated = 0;
		if (reanimate && modelsToRean < defenderModels) {
			let reanimatesuccess = 0;
			for (let rean_i = 0; rean_i < modelsToRean * defenderW; rean_i++) {
				reanimatesuccess += Number(check(roll(), reanimateagainst))
			}
			reanimated = Math.floor(reanimatesuccess / defenderW);
		}
		total_reanimated += reanimated;
		total_effdamage -= reanimated * defenderW;
	} //Iterations end

	outputBox.innerHTML = "";
	if (total_attacksMade) outputBox.innerHTML += "<span class='outputCataR' title='The number of attacks made on the defending unit.'>Attacks</span>: " + total_attacksMade + " (" + Math.round(total_attacksMade / iterations) + ")<br>"
	if (total_bonusAttack) outputBox.innerHTML += "<span class='outputCataB' title='The number of extra attacks made on the Hit roll.'>Bonus attacks</span>: " + total_bonusAttack + " (" + Math.round(total_bonusAttack / iterations) + ")<br>"
	if (total_hits) outputBox.innerHTML += "<span class='outputCataR' title='The number of successful Hit rolls.'>Hits</span>: " + total_hits + " (" + Math.round(total_hits / iterations) + ")<br>"
	if (total_hitreroll) outputBox.innerHTML += "<span class='outputCataB' title='The number of Hit rerolls that would have been failures.'>Hit re-rolls</span>: " + total_hitreroll + " (" + Math.round(total_hitreroll / iterations) + ")<br>"
	if (total_autohits) outputBox.innerHTML += "<span class='outputCataB' title='How many auto-hits you scored'>Auto-hits</span>: " + total_autohits + " (" + Math.round(total_autohits / iterations) + ")<br>"
	if (total_wounds + total_apwounds) outputBox.innerHTML += "<span class='outputCataR' title='The number of successful Wound rolls'>Wounds</span>: " + Number(total_wounds + total_apwounds) + " (" + Math.round(Number(total_wounds + total_apwounds) / iterations) + ")<br>"
	if (total_apwounds) outputBox.innerHTML += "<span class='outputCataR' title='The number of wounds that had bonus AP from the wound roll.'>Bonus AP</span>: " + Number(total_apwounds) + " (" + Math.round(Number(total_apwounds) / iterations) + ")<br>"
	if (total_autowounds) outputBox.innerHTML += "<span class='outputCataB' title='How many auto-wounds you scored'>Auto-wounds</span>: " + total_autowounds + " (" + Math.round(total_autowounds / iterations) + ")<br>"
	if (total_woundreroll) outputBox.innerHTML += "<span class='outputCataB' title='The number of Wound rerolls that would have been failures.'>Wound re-rolls</span>: " + total_woundreroll + " (" + Math.round(total_woundreroll / iterations) + ")<br>"
	if (total_ignored) outputBox.innerHTML += "<span class='outputCataB' title='The number of wounds that were ignored that would have been successful.'>Ignored Wounds</span>: " + total_ignored + " (" + Math.round(total_ignored / iterations) + ")<br>"
	if (total_saves) outputBox.innerHTML += "<span class='outputCataB' title='The number of saves that the defender would have made normally.'>Saves</span>: " + total_saves + " (" + Math.round(total_saves / iterations) + ")<br>"
	if (total_invulns) outputBox.innerHTML += "<span class='outputCataB' title='The number of saves that the defender would have made with Invulnerable saves.'>Invulnerable Saves</span>: " + total_invulns + " (" + Math.round(total_invulns / iterations) + ")<br>"
	if (total_damage) outputBox.innerHTML += "<span class='outputCataR' title='The amount of damage that was rolled for, before considering target Wounds characteristic or mitigation.'>Damage</span>: " + total_damage + " (" + Math.round(total_damage / iterations) + ")<br>"
	if (total_unfelt) outputBox.innerHTML += "<span class='outputCataB' title='The amount of damage prevented by Feel No Pain'>Feel No Pains</span>: " + total_unfelt + " (" + Math.round(total_unfelt / iterations) + ")<br>"
	if (total_shielded) outputBox.innerHTML += "<span class='outputCataB' title='The amount of damage prevented by Damage Reduction'>Shielded</span>: " + total_shielded + " (" + Math.round(total_shielded / iterations) + ")<br>"
	if (total_mortals) outputBox.innerHTML += "<span class='outputCataR' title='The amount of Mortal wounds inflicted on the target.'>Mortal Wounds</span>: " + total_mortals + " (" + Math.round(total_mortals / iterations) + ")<br>"
	if (total_modelsKilled) outputBox.innerHTML += "<span class='outputCataR' title='The number of models in the defending unit would have killed.'>Models Killed</span>: " + total_modelsKilled + " (" + Math.round(total_modelsKilled / iterations) + ")<br>"
	if (total_foughtback) outputBox.innerHTML += "<span class='outputCataB' title='The number of models that fought back before dying in the defending unit.'>Fought back</span>: " + total_foughtback + " (" + Math.round(total_foughtback / iterations) + ")<br>"
	if (total_reanimated) outputBox.innerHTML += "<span class='outputCataB' title='The number of models that were brought back by Reanimation Protocol.'>Reanimated</span>: " + total_reanimated + " (" + Math.round(total_reanimated / iterations) + ")<br>"
	if (total_squadwipe) outputBox.innerHTML += "<span class='outputCataR' title='The number of times in this simulation the attacking unit completely destroyed the defneding unit.'>Squads Wiped</span>: " + total_squadwipe + " (" + Math.round(total_squadwipe / iterations) + ")<br>"
	outputBox.innerHTML += "<span class='outputCataR' title='The amount of damage you actually inflicted (excess damage not needed to kill a model is ignored, along with shields and abilities)'>Effective Damage</span>: " + total_effdamage +
		" (" + Math.round(total_effdamage / iterations) + ")<br>"
	outputBox.innerHTML += "<span class='outputCataG' title='Effective Damage Per Attack: How much damage each models attack would have done'>EDPA</span>: " + Number(total_effdamage / (total_attacksMade)) + "<br>"
	outputBox.innerHTML += "<span class='outputCataG' title='Effective Damage Per Unit: How much damage the whole units attack would have done'>EDPU</span>: " + Number(total_effdamage / iterations) + "<br>"
}

// https://davidwalsh.name/query-string-javascript
function importFromQuery() {
	var urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get('import')) {
		if (urlParams.get('return') == 'json') {
			document.write(JSON.stringify(parseImport(urlParams.get('import'))));
		} else {
			parseImport(urlParams.get('import'))
		}
	}
}
