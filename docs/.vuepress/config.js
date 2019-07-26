module.exports = {
  title: '我的前端小册',
  description: '我的前端小册',
  themeConfig: {
    nav: [
      { text: 'HOME', link: '/' },
      { text: '前端', link: '/js/' },
      { text: '计算机通识', link: '/network/' },
      { text: 'GitHub', link: 'https://jobbym.github.io' }
    ],
    displayAllHeaders: false,
    sidebarDepth: 2,
    sidebar: [
      '/',
      {
        title: '前端',
        path: '/js/',
        collapsable: false,
        children: [
          '/js/',
          '/browser/',
          '/performace/',
          '/safety/',
          '/framework/',
          '/Vue/',
          '/React/',
        ]
      },
      {
        title: '计算机通识',
        children: [
          '/network/',
          '/datastruct/',
          '/algorithm/',
        ]
      }
    ],
    lastUpdated: 'Last Updated'
  }
}