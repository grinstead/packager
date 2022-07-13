export function yoyo() {
  return "Bam!";
}

function foo(count = 0) {
  return Math.random() < 0.8 ? foo(count + 1) : count;
}

function helloWorld() {
  const a = "Yo";
  const b = "Bla";
  const swap = Math.random() < 0.5;
  console.log(swap ? b + a : a + b);
  console.log(foo());
}

window["export_function_helloWorld"] = helloWorld;

helloWorld();
