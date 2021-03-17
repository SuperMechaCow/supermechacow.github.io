class Army {
  constructor() {

  }
  detachments = [];
  units = [];
}

class Detachment {
  constructor() {

  }
  hqs = [];
  troops = [];
  elites = [];
  fasts = [];
  heavys = [];
  transports = [];
  fliers = [];
}

class Unit {
  constructor() {

  }
  name = '';
  categories = [];
  rules = []
  abilities = [];
  modelQty = [];
  weaponQty = [];
  models = [];
  pl = 0;
  pts = 0
}

class Model {
  constructor(statLineArray, weapons) {
    if (statLineArray) {
      let counter = 0;
      for (const stat in this.statlines) {
        counter++;
        this.statlines[stat] = statLineArray[counter]
      }
    }
    this.name = statLineArray[0];
    this.weapons = weapons;
  }
  name = 'Dude';
  statlines = {
    "M": 0,
    "WS": 0,
    "BS": 0,
    "S": 0,
    "T": 0,
    "W": 0,
    "A": 0,
    "Ld": 0,
    "Sv": 0
  };
  weapons = [];

  addWeaponStats = function(weaponIndex) {
    getBoxes();
    for (stat in this.weapons[weaponIndex]) {
      switch (stat) {
        case 'A':
          if (this.weapons[weaponIndex]['type'] == 'Melee') {
            attackerA_box.value = this.weapons[weaponIndex][stat];
            attackerAS_box.value = this.statlines['WS'];
            if (this.weapons[weaponIndex]['S'] != "User") attackerS_box.value = eval(Number(this.statlines['S']) + Number(this.weapons[weaponIndex]['S']));
            else attackerS_box.value = this.statlines['S']
          } else {
            if (this.weapons[weaponIndex][stat].includes('D')) {
              let temp_stat = this.weapons[weaponIndex][stat].split('D');
              if (!temp_stat[0]) temp_stat[0] = 1;
              if (this.weapons[weaponIndex][stat].includes('+')) {
                temp_stat.push(temp_stat[1].split('+')[1]);
              }
              if (temp_stat[0]) randomAttacksDice_box.value = Number(temp_stat[0]);
              if (temp_stat[1]) randomAttacksDenom_box.value = Number(temp_stat[1]);
              if (temp_stat[2]) randomAttacksMod_box.value = Number(temp_stat[2]);
              attackerA_box.value = 0;
            } else {
              attackerA_box.value = this.weapons[weaponIndex]['A'];
            }
            attackerAS_box.value = this.statlines['BS'];
            attackerS_box.value = this.weapons[weaponIndex]['S'];
          }
          break;
        case 'AP':
          attackerAP_box.value = this.weapons[weaponIndex][stat];
          break;
        case 'D':
          if (this.weapons[weaponIndex][stat].includes('D')) {
            let temp_stat = this.weapons[weaponIndex][stat].split('D');
            if (!temp_stat[0]) temp_stat[0] = 1;
            if (this.weapons[weaponIndex][stat].includes('+')) {
              temp_stat[1] = temp_stat[1].split('+')[0];
              temp_stat.push(temp_stat[1].split('+')[1]);
            }
            if (temp_stat[0]) attackerDmulti_box.value = Number(temp_stat[0]);
            if (temp_stat[1]) attackerDdenom_box.value = Number(temp_stat[1]);
            if (temp_stat[2]) attackerDmod_box.value = Number(temp_stat[2]);
          } else {
            attackerDmulti_box.value = 0;
            attackerDdenom_box.value = this.weapons[weaponIndex][stat];
            attackerDmod_box.value = 0;
          }
          break;
        case 'Abilities':
          let abilTexts = [];
          for (ability in this.weapons[weaponIndex][stat]) {
            abilTexts.push(ability);
            this.weapons[weaponIndex][stat][ability]();
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
}

class Weapon {
  constructor() {

  }
  name = 'Gun';
  range = 0;
  type = 'Rapid Fire';
  A = 0;
  S = 0;
  AP = 0;
  D = 0;
}

let atkr_army = {
  units: []
};

let dfdr_army = {
  units: []
};

function loadUnit(unitLoad) {
  getBoxes();
}

function loadModel(modelLoad) {
  getBoxes();
  for (stat in modelLoad.statlines) {
    switch (stat) {
      case 'Mdls':
        //Need to parse from modelLoad names
        // if (!activeUnit) {}
        break;
      case 'A':
        if (!active_army) attackerA_box.value = modelLoad.statlines['A'];
        break;
      case 'WS':
        if (!active_army) attackerAS_box.value = modelLoad.statlines['WS'];
        break;
      case 'S':
        if (!active_army) attackerS_box.value = modelLoad.statlines['S'];
        break;
      case 'AP':
        if (!active_army) attackerAP_box.value = 0;
        break;
      case 'T':
        if (active_army) defenderT_box.value = modelLoad.statlines['T'];
        break;
      case 'W':
        if (active_army) defenderW_box.value = modelLoad.statlines['W'];
        break;
      case 'Sv':
        if (active_army) defenderSv_box.value = modelLoad.statlines['Sv'];
        break;
      default:
        break;
    }
  }
  if (!active_army) {
    attackerName_box.innerHTML = modelLoad.name;
    while (weaponsBox.options.length) weaponsBox.remove(0);
    modelLoad.weapons.forEach((weapon, i) => {
      let opt = document.createElement("option")
      opt.text = weapon['name'];
      weaponsBox.options.add(opt);
      weaponsBox.style.visibility = "visible";
    });
    weaponsBox.addEventListener('change', function(e) {
      modelLoad.addWeaponStats(e.target.selectedIndex)
    });
    modelLoad.addWeaponStats(0)
    // active_army = 1;
  } else {
    defenderName_box.innerHTML = modelLoad.name;
    // active_army = 0;
  }
  $("#content").accordion("option", "active", 0);
}

function weaponLookup(abilityText) {
  let abilities = {}
  //Loop through all abilities.
  //check against checking function (includes or regex)
  //if found, add to abilities object
  return abilities;
}

function parseImport(importText, army) {
  if (importText) var copypasta = importText;
  else var copypasta = importBox.value;

  //Update input/output values
  getBoxes();
  //Capture all categories
  // let regExp = /\*\*\W*\s*(\D+)\[(\d+)\D*(\d+).+\].*\*\*/g;
  //Capture Unit category
  let unitExp = /\*\*\s*(\D+)\[(\d+)\D+(\d+).+\].*\*\*/g;
  //capture model category
  let modelExp = /\*\*(\D+):\*\* M:(\d*).*\|WS:(\d*).*\|BS:(\d*).*\|S:(\d*).*\|T:(\d*).*\|W:(\d*).*\|A:(\d*).*\|Ld:(\d*).*\|Save:(\d*).*/g;
  //Read the import box
  //Check to make sure it's not empty
  if (copypasta) {
    //Split into lines
    if (copypasta.includes('\n')) {
      copypasta = copypasta.split("\n");
    } else if (copypasta.includes(' . ')) {
      copypasta = copypasta.split(" . ");
    }
    //Temporary tracking array
    var units = [];
    //:oop through each line and find a unit
    copypasta.forEach((line, i) => {
      let newUnit = new Unit();
      let unitMatch = unitExp.exec(line);
      //If you found one
      if (unitMatch && !unitMatch[0].includes("**+")) {
        //Remove the original input line from the array
        unitMatch.shift();
        for (var j = i + 1; j < copypasta.length; j++) {
          let modelMatch = modelExp.exec(copypasta[j]);
          if (unitExp.exec(copypasta[j])) {
            //If the next unit was found, stop looping here
            break;
          } else {
            let checkMatch = /\*\*(\D+?):\*\*\s\*(.+?)\*/g.exec(copypasta[j]);
            if (checkMatch) {
              // checkMatch[1] = checkMatch[1].replace(/\*/g, '')
              switch (checkMatch[1]) {
                case 'Categories':
                  newUnit.categories = checkMatch[2].split(', ');
                  break;
                case 'Rules':
                  newUnit.rules = checkMatch[2].split(', ');
                  break;
                case 'Abilities':
                  newUnit.abilities = checkMatch[2].split(', ');
                  break;
                case 'Unit':
                  // newUnit.name = checkMatch[2];
                  break;
                default:

                  break;
              }
            }
            checkMatch = /.*\*\*Weapons?:\*\*\s\*(.+?)\*/g.exec(copypasta[j]);
            if (checkMatch) {
              if (!newUnit.weaponQty.length) {
                checkMatch[1].split(', ').forEach((weap, i) => {
                  newUnit.weaponQty.push({
                    [weap]: 1
                  })
                });
              }
            }
            checkMatch = /.*\*\*Unit:\*\*\s\*(.+?)\*/g.exec(copypasta[j]);
            let modelQty = [];
            if (checkMatch) {
              checkMatch[1].split(', ').forEach((mdl, i) => {
                newUnit.modelQty.push({
                  [mdl]: 1
                })
              });
            }
            checkMatch = /.*\*\*Warlord Traits?:\*\*\s\*(.+?)\*/g.exec(copypasta[j]);
            if (checkMatch) {
              newUnit.traits = checkMatch[1].split(', ');
            }
            checkMatch = /.*\*\*(\d+)x\s(\D+)\s\[.*\:\*\*\s(.*)/g.exec(copypasta[j]);
            //. **9x Space Marine [162pts]:** 9x Astartes Chainsword, 9x Bolt pistol, 9x Frag & Krak grenades
            if (checkMatch) {
              let modelQty = [];
              let weaponQty = [];
              //Overwrite other data if found here instead.
              newUnit.modelQty, newUnit.weaponQty = [];
              newUnit.modelQty.push({
                [checkMatch[2]]: checkMatch[1]
              })
              checkMatch[3].split(', ').forEach((weap, i) => {
                checkWeap = /(\d+)x\s(.+)/g.exec(weap);
                if (checkWeap) {
                  newUnit.weaponQty.push({
                    [checkWeap[2]]: checkWeap[1]
                  });
                }
              });
            }
          }
        }
        //Start looping at the line after the unit was found until the end of import data
        //Temporary tracking array
        let models = [];
        for (var j = i + 1; j < copypasta.length; j++) {
          let modelMatch = modelExp.exec(copypasta[j]);
          if (unitExp.exec(copypasta[j])) {
            //If the next unit was found, stop looping here
            break;
          } else if (modelMatch) {
            //See if there's a model in this line
            //If you find one
            //Remove the input line data
            modelMatch.shift();
            let weapons = [];
            for (var k = j + 1; k < copypasta.length; k++) {
              if (unitExp.exec(copypasta[k])) {
                //If the next unit was found, stop looping here
                break;
              } else if (copypasta[k].includes("** Range:")) {
                let weapon = new Weapon;
                let weaponLine = copypasta[k].split("|");
                //GRAB NAME HERE BEFORE SHIFTING IT OUT!
                weapon.name = weaponLine[0].split("**")[1].replace(":", '');
                weapon.range = weaponLine.shift().split(':')[2].replace("\"", '');
                weaponLine.forEach((stat, i) => {
                  stat = stat.split(":");
                  if (stat[0] == "Type") {
                    if (stat[1] == "Melee") {
                      weapon.type = stat[1];
                      weapon.A = modelMatch[7];
                      weapon.range = 'Melee';
                    } else {
                      let typeSplit = stat[1].split(' ');
                      if (typeSplit[0] == "Rapid") {
                        weapon.type = typeSplit[0] + ' ' + typeSplit[1];
                        weapon.A = typeSplit[2];
                      } else {
                        weapon.type = typeSplit[0];
                        weapon.A = typeSplit[1];
                      }
                    }
                  } else if (stat[0] == "S" || stat[0] == "D") {
                    weapon[stat[0]] = stat[1];
                  } else if (stat[0] == "Abilities") {
                    weapon[stat[0]] = weaponLookup(stat[1]);
                  } else if (stat[0] && stat[1]) {
                    stat[1] = Number(stat[1].replace(/[^0-9.]/, ''));
                    weapon[stat[0]] = stat[1];
                  }
                });
                weapons.push(weapon);
              }
            }
            //Create a new model and add it to the temporary model list
            models.push(new Model(modelMatch, weapons));
          }
        }
        //If there are no models, there isn't a unit
        if (models.length) {
          if (!newUnit.name) newUnit.name = unitMatch[0];
          newUnit.pl = unitMatch[1];
          newUnit.pts = unitMatch[2];
          newUnit.models = models
          // console.log(newUnit);
          units.push(newUnit);
        }
      }
    });
    importBox.value = '';
    importBox.placeholder = 'Nom nom nom!\n\nPaste another BattleScribe unit here to import an opponent, or click the Import button again now to switch back to the unit you just imported.'
    if (!active_army) {
      atkr_army = new Army()
      atkr_army.units = units;
      flipArmy();
      document.getElementById('lopenNav').style = "visibility: visible;";

      return atkr_army;
    } else {
      dfdr_army = new Army()
      dfdr_army.units = units;
      flipArmy();
      document.getElementById('ropenNav').style = "visibility: visible;";
      return dfdr_army;
    }
  } else {
    flipArmy();
  }
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
