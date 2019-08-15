module.exports = {
  base: '/frontend/',
  title: '我的前端小册',
  description: '我的前端小册',
  themeConfig: {
    nav: [
      { text: 'HOME', link: '/' },
      { text: '前端', link: '/js/' },
      { text: '计算机通识', link: '/network/' },
      { 
        text: 'GitHub', 
        items: [
          { text: '博客', link: 'https://jobbym.github.io/' },
          { text: 'JavaScript 进阶问题列表', link: 'https://github.com/lydiahallie/javascript-questions/blob/master/zh-CN/README-zh_CN.md' },
        ]
      }
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
          '/performance/',
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