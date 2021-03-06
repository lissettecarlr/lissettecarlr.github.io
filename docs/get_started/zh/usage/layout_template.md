布局模板 - 自定义 HTML 布局
==========

## 布局模板使用方法

首先写布局模板文件, 支持 `Jinja2` 语法, 写法可以参考默认[主题插件的布局模板的写法](https://github.com/teedoc/teedoc/tree/main/plugins/teedoc-plugin-theme-default/teedoc_plugin_theme_default/templates).

模板文件可以放到两个地方, 一个是放到主题插件里面, 插件作者可以这样做；

另一个就是放到布局模板文件夹(默认文档根目录`layout`)下, 然后单独对特定的页面使用特定的布局模板, 在文章头部`metadata`处添加`layout`键值:
`layout`: 页面使用的布局模板, 默认不需要这个键值, 会使用主题插件里面的配置,需要你需要自定义这个页面的布局, 可以设置这个参数, 路径相对于`site_config`中的`layout_root_dir`路径, `layout_root_dir` 默认为`layout`, 所以要使用`layout/special_layout.html` 只需要填写`special_layout.html`


这里列出了所有的支持的变量:

## jinja2 模板变量

### page head info

* `page_id`: page id , a string, set in doc config and doc metadata
* `page_classes`: page classes, a list, set in doc config and doc metadata
* `keywords`: keywords, a list, set in doc metadata
* `description`: description, a string, set in doc metadata
* `header_items`: tags in head(`<head></head>`) tag, a string list
* `title`: page title, can be null, string, set in doc metadata
* `site_name`: site name, string, set in site config

### navbar

* `logo_url`: site logo image url, string, can be null, set in doc config
* `logo_alt`: site logo alt info, string, can be null, set in doc config
* `home_url`: home url, e.g. "/", "/site0/", string
* `navbar_title`: navbar title, html string, can be null, set in doc config
* `navbar_main`: navbar left html, html string
* `navbar_options`: navbar right html, html string
* `navbar_plugins`: navbar plugins html, html string

### sidebar info

pages no sidebar, only article of docs have

* `sidebar_title`: sidebar title, string, can be html string, set in doc sidebar config
* `sidebar_items_html`: sidebar items html, html string

### body info

#### article of docs body info

* `article_title`: doc's article title, string, set in doc metadata
* `tags`: article tags, a string list, set in doc metadata
* `author`: article author, string, can be null, set in doc metadata
* `date`: article create date, string, can be null, set in doc metadata
* `show_source`: show source button info, string, can be null, set in site config and doc metadata
* `source_url`: source file's url, valid only when show_source is not null
* `body`: body html, html string
* `previous`: previous article, can be null
  * `title`: previous article title, string
  * `url`:  previous article url, string
* `next`: next article
  * `title`: next article title, string
  * `url`:  next article url, string
* `toc`: toc html string, can be null


#### pages body info

* `body`: body html, html string

### page footer info

* `footer_top`: footer top html string
* `footer_bottom`: footer bottom html string
* `footer_js_items`: js items last load int html, string list
