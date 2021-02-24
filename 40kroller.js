/*
Ideapad:

- Copy/paste from Battlescribe
- Verbose battle reports
- Random tooltip over banner
- Banner opens menu option or copy/paste

*/
var debug = false;

var iterations = 1;

var activeUnit = 0;

var units = [{
	weapons: []
}, {
	weapons: []
}];

$(function() {
	var lastAccordion = 0;
	$("#modbox").accordion({
		active: 6,
		collapsible: true,
		heightStyle: 'content',
		animate: {
			easing: 'linear',
			duration: 100,
		},
		activate: function(event, ui) {
			var active = $("#modbox").accordion("option", "active");
			if (active === false && lastAccordion == 6) {
				$("#modbox").accordion("option", "active", 6);
				krunchit();
			} else if (active === false && lastAccordion == 7) {
				parseImport();
				$("#modbox").accordion("option", "active", 7);
			} else if (active == 7) {
				if (!activeUnit) {
					document.getElementById('importButton').innerHTML = 'Tap to Import Attacker';
				} else {
					document.getElementById('importButton').innerHTML = 'Tap to Import Defender';
				}
			} else if (active == 6) {
				document.getElementById('simulateButton').innerHTML = 'Tap to Simulate';
			} else if (active === false) {
				$("#modbox").accordion("option", "active", 6);
			}
		},
		beforeActivate: function(event, ui) {
			lastAccordion = $("#modbox").accordion("option", "active");
			if (lastAccordion == 7) {
				document.getElementById('importButton').innerHTML = 'Import';
			} else if (lastAccordion == 6) {
				document.getElementById('simulateButton').innerHTML = 'Simulation';
			}
		}
	});
	$(document).tooltip({
		show: {
			delay: 1500,
			duration: 500
		},
		hide: {
			delay: 0,
			duration: 0
		}
	});
});


function parseImport() {
	// ¯\_(ツ)_/¯
	getBoxes();
	if (importBox.value) {
		let copypasta = importBox.value;
		units[activeUnit].weapons = [];
		copypasta = copypasta.split("\n");
		let modelGrabber = false;
		copypasta.forEach((line, i) => {
			if (line.includes("** M:") && !modelGrabber) {
				line = line.split("|")
				units[activeUnit]["name"] = line[0].split("**")[1].replace(":", '');
				line.shift();
				line.forEach((stat, i) => {
					if (stat) {
						stat = stat.split(":");
						stat[1] = Number(stat[1].replace(/[^0-9.]/, ''));
						units[activeUnit][stat[0]] = stat[1];
					}
				});
				modelGrabber = true;
			} else if (line.includes("** Range:")) {
				let weapon = {}
				line = line.split("|")
				//GRAB NAME HERE BEFORE SHIFTING IT OUT!
				weapon["name"] = line[0].split("**")[1].replace(":", '');
				line.shift();
				line.forEach((stat, i) => {
					stat = stat.split(":");
					if (stat[0] == "Type") {
						if (stat[1] == "Melee") {
							weapon['type'] = stat[1];
							weapon['A'] = units[activeUnit]['A'];
						} else {
							let typeSplit = stat[1].split(' ');
							weapon['type'] = typeSplit[0];
							weapon['A'] = typeSplit[1];
						}
					} else if (stat[0] == "S" || stat[0] == "D") {
						weapon[stat[0]] = stat[1];
					} else if (stat[0] == "Abilities") {
						weapon[stat[0]] = abilityLookup(stat[1]);
					} else if (stat[0] && stat[1]) {
						stat[1] = Number(stat[1].replace(/[^0-9.]/, ''));
						weapon[stat[0]] = stat[1];
					}
				});
				units[activeUnit].weapons.push(weapon);
			}
		});
		//Validate data here
		for (stat in units[activeUnit]) {
			switch (stat) {
				case 'Mdls':
					//Need to parse from model names
					// if (!activeUnit) {}
					break;
				case 'A':
					attackerA_box.value = units[activeUnit]['A'];
					break;
				case 'WS':
					attackerAS_box.value = units[activeUnit]['WS'];
					break;
				case 'S':
					attackerS_box.value = units[activeUnit]['S'];
					break;
				case 'AP':
					attackerAP_box.value = 0;
					break;
				case 'T':
					defenderT_box.value = units[activeUnit]['T'];
					break;
				case 'W':
					defenderW_box.value = units[activeUnit]['W'];
					break;
				case 'Sv':
					defenderSv_box.value = units[activeUnit]['Sv'];
					break;
				case 'name':
					if (activeUnit === 0) {
						attackerName_box.innerHTML = units[activeUnit]["name"];
					} else {
						defenderName_box.innerHTML = units[activeUnit]["name"];
					}
					break;
				case 'weapons':
					while (weaponsBox.options.length) weaponsBox.remove(0);
					units[activeUnit]["weapons"].forEach((weapon, i) => {
						let opt = document.createElement("option")
						opt.text = weapon['name'];
						weaponsBox.options.add(opt);
						weaponsBox.style.visibility = "visible";
					});
					break;
				default:
					break;
			}
		}
		updateWeaponsStatLines(0);
		importBox.value = '';
		importBox.placeholder = 'Nom nom nom!\n\nPaste another BattleScribe unit here to import an opponent, or click the Import button again now to switch back to the unit you just imported.'
	}
	if (activeUnit) activeUnit = 0;
	else activeUnit = 1;
}

function abilityLookup(abilityText) {
	let abilities = {}
	if (abilityText.includes('When the bearer fights, it makes 1 additional attack with this weapon.')) {
		let effect = function() {
			attackerA_box.value++;
		}
		abilities["+1 A from weapon."] = effect;
	} else if (abilityText.includes('Blast.')) {
		let effect = function() {
			//Blast effects here
		}
		abilities["Blast."] = effect;
	}
	return abilities;
}

function updateWeaponsStatLines(weaponIndex) {
	getBoxes();
	for (stat in units[0].weapons[weaponIndex]) {
		switch (stat) {
			case 'A':
				if (units[0].weapons[weaponIndex]['type'] == 'Melee') {
					attackerA_box.value = units[0].weapons[weaponIndex][stat];
					attackerAS_box.value = units[0]['WS'];
					if (!units[0].weapons[weaponIndex]['S'] == "User") attackerS_box.value = eval(units[0]['S'] + units[0].weapons[weaponIndex]['S']);
					else attackerS_box.value = units[0]['S']
				} else {
					if (units[0].weapons[weaponIndex][stat].includes('D')) {
						let temp_stat = units[0].weapons[weaponIndex][stat].split('D');
						if (!temp_stat[0]) temp_stat[0] = 1;
						if (units[0].weapons[weaponIndex][stat].includes('+')) {
							temp_stat.push(temp_stat[1].split('+')[1]);
						}
						if (temp_stat[0]) randomAttacksDice_box.value = Number(temp_stat[0]);
						if (temp_stat[1]) randomAttacksDenom_box.value = Number(temp_stat[1]);
						if (temp_stat[2]) randomAttacksMod_box.value = Number(temp_stat[2]);
						attackerA_box.value = 0;
					} else {
						attackerA_box.value = units[0]['A'];
					}
					attackerAS_box.value = units[0]['BS'];
					attackerS_box.value = units[0]['S'];
				}
				break;
			case 'AP':
				attackerAP_box.value = units[0].weapons[weaponIndex][stat];
				break;
			case 'D':
				if (units[0].weapons[weaponIndex][stat].includes('D')) {
					let temp_stat = units[0].weapons[weaponIndex][stat].split('D');
					if (!temp_stat[0]) temp_stat[0] = 1;
					if (units[0].weapons[weaponIndex][stat].includes('+')) {
						temp_stat[1] = temp_stat[1].split('+')[0];
						temp_stat.push(temp_stat[1].split('+')[1]);
					}
					if (temp_stat[0]) attackerDmulti_box.value = Number(temp_stat[0]);
					if (temp_stat[1]) attackerDdenom_box.value = Number(temp_stat[1]);
					if (temp_stat[2]) attackerDmod_box.value = Number(temp_stat[2]);
				} else {
					attackerDmulti_box.value = 0;
					attackerDdenom_box.value = units[0].weapons[weaponIndex][stat];
					attackerDmod_box.value = 0;
				}
				break;
			case 'Abilities':
				let abilTexts = [];
				for (ability in units[0].weapons[weaponIndex][stat]) {
					abilTexts.push(ability);
					units[0].weapons[weaponIndex][stat][ability]();
				}
				if (abilTexts.length) {
					attackerName_box.title = "";
					abilTexts.forEach((item, i) => {
						attackerName_box.title = item + "\n";
					});
				}
			default:
				break;
		}
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

function dumpit() {
	getBoxes();
	var copystring = document.getElementById("output").innerHTML;
	copystring = copystring.replace(/<br>/g, '\n');
	copystring = copystring.replace(/<span[^>]*>/g, '> **');
	copystring = copystring.replace(/<\/span[^>]*>/g, '**');
	copystring = '# ' + iterations + ' Fight Results\n' + copystring + '[supermechacow.github.io](https://supermechacow.github.io)'
	var temp = document.createElement("textarea");
	temp.value = copystring
	document.body.appendChild(temp);
	temp.select();
	document.execCommand("copy");
	temp.remove();
	output.innerHTML += `<br>Copied results to clipboard as Markdown.<br>`
}

function getBoxes() {
	// Attack/Defend values
	attackerName = document.getElementById('attackerName').innerHTML;
	attackerModels = Number(document.getElementById('attackerModelsbox').value);
	attackerA = Number(document.getElementById('attackerAbox').value);
	attackerAS = Number(document.getElementById('attackerASbox').value);
	attackerS = Number(document.getElementById('attackerSbox').value);
	attackerAP = Number(document.getElementById('attackerAPbox').value);
	defenderModels = Number(document.getElementById('defenderModelsbox').value);
	defenderT = Number(document.getElementById('defenderTbox').value);
	defenderW = Number(document.getElementById('defenderWbox').value);
	defenderSv = Number(document.getElementById('defenderSvbox').value);
	defenderName = document.getElementById('defenderName').innerHTML;

	// Attack/Defend values
	attackerName_box = document.getElementById('attackerName');
	attackerModels_box = document.getElementById('attackerModelsbox');
	attackerA_box = document.getElementById('attackerAbox');
	attackerAS_box = document.getElementById('attackerASbox');
	attackerS_box = document.getElementById('attackerSbox');
	attackerAP_box = document.getElementById('attackerAPbox');
	defenderModels_box = document.getElementById('defenderModelsbox');
	defenderT_box = document.getElementById('defenderTbox');
	defenderW_box = document.getElementById('defenderWbox');
	defenderSv_box = document.getElementById('defenderSvbox');
	defenderName_box = document.getElementById('defenderName');

	//Hit Modifiers
	hitMod = document.getElementById('HitMod').checked;
	if (document.getElementById('rerollhit').checked) rerollHITagainst = Number(document.getElementById('rerollHITagainst').value)
	else rerollHITagainst = 0;
	exploding6s = document.getElementById('explode6').checked;
	autowound6s = document.getElementById('autowound6').checked;
	//Wounds Modifiers
	wMod = document.getElementById('WMod').checked;
	if (document.getElementById('rerollwound').checked) rerollWDagainst = Number(document.getElementById('rerollWDagainst').value)
	else rerollWDagainst = 0;
	randomAttacks = document.getElementById('randomAttacks').checked
	randomAttacksDice = Number(document.getElementById('randomAttacksDice').value)
	randomAttacksDenom = Number(document.getElementById('randomAttacksDenom').value)
	randomAttacksMod = Number(document.getElementById('randomAttacksMod').value)
	flamer = document.getElementById('flamer').checked
	mortalson6s = document.getElementById('mwo6').checked;
	apon6s = document.getElementById('apo6').checked;
	extrahit6 = document.getElementById('extrahit6').checked;
	apo6amount = Number(document.getElementById('apo6amount').value);
	ignorebelowamount = Number(document.getElementById('ignorebelowamount').value);
	//Save Modifiers
	svMod = document.getElementById('SvMod').checked;
	invuln = document.getElementById('defenderInvChecked').checked;
	defenderInv = Number(document.getElementById('defenderInvbox').value);
	fnp = document.getElementById('defenderFNPChecked').checked;
	defenderFNP = Number(document.getElementById('defenderFNPbox').value);
	//Damage Modifiers
	attackerDmulti = Number(document.getElementById('attackerDmultibox').value);
	attackerDdenom = Number(document.getElementById('attackerDdenombox').value);
	attackerDmod = Number(document.getElementById('attackerDmodbox').value);
	flatDR = Number(document.getElementById('flatDRbox').value);
	fightback = document.getElementById('fightback').checked;
	fightbackagainst = Number(document.getElementById('fightbackagainst').value);
	reanimate = document.getElementById('reanimate').checked;
	reanimateagainst = Number(document.getElementById('reanimateagainst').value);
	// reanimatereroll = Number(document.getElementById('reanimatereroll').value);
	// reanimatemod = Number(document.getElementById('reanimatemod').value);

	attackerDmulti_box = document.getElementById('attackerDmultibox');
	attackerDdenom_box = document.getElementById('attackerDdenombox');
	attackerDmod_box = document.getElementById('attackerDmodbox');
	randomAttacks_box = document.getElementById('randomAttacks').checked;
	randomAttacksDice_box = document.getElementById('randomAttacksDice');
	randomAttacksDenom_box = document.getElementById('randomAttacksDenom');
	randomAttacksMod_box = document.getElementById('randomAttacksMod');
	//Output box
	outputBox = document.getElementById('output');
	importBox = document.getElementById('importBox');
	weaponsBox = document.getElementById('weaponsBox')

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
			let modelHP = defenderW;
			let squadwipe = 0;
			let foughtback = 0;
			let modelsKilled = 0;
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
						if (modelHP == 0) {
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
