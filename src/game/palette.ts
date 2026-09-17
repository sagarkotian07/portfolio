// Two looks for the same geometry: the healthy sky forest and the corrupted purple version.
export interface Palette {
  sky0: string; sky1: string; cloud: string;
  body: string; body2: string; spot: string; edge: string; rim: string;
  grass: string; grass2: string; grass3: string;
  bush: string; bush2: string; bushLine: string;
  flower: string; flower2: string; flowerLine: string; centre: string; centre2: string;
  white: string; white2: string; whiteLine: string; whiteCentre: string;
  stem: string; stem2: string; leafLine: string;
  board: string; board2: string; boardLine: string; post: string; icon: string; icon2: string; iconLine: string;
  bgStalk: string; bgStalk2: string; bgCap: string; bgIsland: string; bgIsland2: string; bgGrass: string; bgLeaf: string;
}
export const GREEN: Palette = {
  sky0: '#4FA6E6', sky1: '#72C6F2', cloud: '#FFFFFF',
  body: '#0B4A22', body2: '#083A1B', spot: '#063418', edge: '#052F16', rim: '#1F7A38',
  grass: '#33D22B', grass2: '#8CEB55', grass3: '#22A81F',
  bush: '#2CB92A', bush2: '#59DA3E', bushLine: '#1E8A1E',
  flower: '#F03A4E', flower2: '#C7243A', flowerLine: '#8F1A2B', centre: '#FFD23A', centre2: '#E29A16',
  white: '#FFFFFF', white2: '#E4E9EF', whiteLine: '#98A4B4', whiteCentre: '#F5B91E',
  stem: '#43C233', stem2: '#2C8D26', leafLine: '#1F6E1E',
  board: '#C98A4F', board2: '#9E6532', boardLine: '#6B3F1A', post: '#8E8E8E', icon: '#F58A1F', icon2: '#FFC93A', iconLine: '#7A3B0A',
  bgStalk: '#6CA5B2', bgStalk2: '#548E9C', bgCap: '#A9DE8F', bgIsland: '#5F98A5', bgIsland2: '#4A7F8D', bgGrass: '#6FD24A', bgLeaf: '#3F8F77',
};
export const PURPLE: Palette = {
  sky0: '#D6AF86', sky1: '#F3D9C0', cloud: '#FFFFFF',
  body: '#3A1C46', body2: '#2E1538', spot: '#27112F', edge: '#22102B', rim: '#5B2F6B',
  grass: '#8C3F9E', grass2: '#B56BC4', grass3: '#6B2E7A',
  bush: '#6E3181', bush2: '#8E4AA3', bushLine: '#4A1E58',
  flower: '#2E9E8E', flower2: '#1F7C70', flowerLine: '#125248', centre: '#3F8DF0', centre2: '#2A62B6',
  white: '#FFFFFF', white2: '#E6E4EC', whiteLine: '#9E96AE', whiteCentre: '#3F8DF0',
  stem: '#7B3A8E', stem2: '#552462', leafLine: '#3E1A49',
  board: '#8FB3C8', board2: '#6E92A8', boardLine: '#3C5566', post: '#8E8E8E', icon: '#3F8DF0', icon2: '#5FA8FF', iconLine: '#1E4A8A',
  bgStalk: '#8A6A4A', bgStalk2: '#6E5238', bgCap: '#A68866', bgIsland: '#5A3A64', bgIsland2: '#472B50', bgGrass: '#8A4D9A', bgLeaf: '#6E4A3A',
};
/** Things that look the same in both worlds. */
export const FIXED = {
  ball: '#EE3B2C', ball2: '#B4231B', ballLine: '#4A1410', shine: '#FFFFFF',
  egg: '#FFE7B8', egg2: '#F2B25A', eggLine: '#8A5A2B', eggShine: '#FFF8E6',
  plank: '#A9642E', plank2: '#7A4419', plankLight: '#C98A4F',
  star: '#FFD23A', star2: '#F2A51F',
  machine: '#9AA1A8', machine2: '#6E767E', machineLine: '#3A3F45', funnel: '#7ED321', funnel2: '#4E9C10', spiral: '#FFFFFF', spiralInk: '#111111',
  bolt: '#FFE95A', bolt2: '#FFF8C0', smoke: '#E8E8E8', smoke2: '#B8B8B8', spiralTeal: '#3FC7B2',
  pumpkin: '#F58A1F', pumpkin2: '#C9661A', pumpkinLine: '#7A3B0A', pumpkinDoor: '#1B1008', pumpkinStem: '#3FAE3A',
  hud: '#FFF2C8', hudLine: '#4A2C12',
  paper: '#F6EFD8', paper2: '#E7DCBC', paperLine: '#B9A987', backdrop: '#5A2E0F', backdrop2: '#7A4218', title: '#E85C1C', text: '#3B2A16',
};
