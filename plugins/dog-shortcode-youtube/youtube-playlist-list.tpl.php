<?php
require_once(realpath(dirname(__FILE__)) . '/_block-direct-access.php');
$type = $tpl_data['type'];
$mode = $tpl_data['mode'];
$item = $tpl_data['item'];
$config = $tpl_data['config'];
$classes = array(
	"dog-sc-item",
	"youtube-sc-item",
	"object-{$type}",
	"mode-{$mode}",
	$config['css_class'][$type],
);
$link_attrs = array(
	'data-id' => $item->id,
	'href' => dog__replace_template_vars($config['url'][$type], array('id' => $item->id)),
);
?>
<div class="<?= dog__to_css_class($classes) ?>">
	<a <?= dog__attributes_array_to_html($link_attrs) ?>>
		<div style="background-image: url('<?= $item->thumbnail ?>');"></div>
		<h3><?= $item->snippet->title ?></h3>
	</a>
</div>