<?php
require_once(realpath(dirname(__FILE__)) . '/_block-direct-access.php');
get_header();
?>
<section itemscope itemtype="http://schema.org/ItemList">
	<?php dog__show_content('_content-post') ?>
</section>
<?php get_footer() ?>