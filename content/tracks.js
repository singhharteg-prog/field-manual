/* The three dossiers. Missions are added to them by html.js, css.js and the
   js-*.js files, in the order they are loaded in index.html. */
FM.track({
  id: 'html',
  order: 1,
  name: 'HTML',
  codename: 'Operation Skeleton',
  tagline: 'The structure of every web page: headings, text, links, images and forms.',
  lang: 'html',
});

FM.track({
  id: 'css',
  order: 2,
  name: 'CSS',
  codename: 'Operation Disguise',
  tagline: 'How a page looks: colour, type, spacing, layout and responsive design.',
  lang: 'css',
});

FM.track({
  id: 'js',
  order: 3,
  name: 'JavaScript',
  codename: 'Operation Brain',
  tagline: 'How a page behaves: logic, data, and reacting to clicks and typing.',
  lang: 'js',
});
