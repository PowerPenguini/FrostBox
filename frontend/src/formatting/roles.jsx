const dictionary = {
  admin: "Administrator",
  manager: "Menedżer",
  driver: "Kerowca",
};

export function translateRole(word) {
  return dictionary[word] || word;
}
