<html>
<body>

<p>
_POST variables are:
<p>

<?php
	foreach ($_POST as $key => $value) {
		echo "Key: $key; Value: $value<br>\n";
	}
?>

<p>
_GET variables are:
<p>

<?php
	foreach ($_GET as $key => $value) {
		echo "Key: $key; Value: $value<br>\n";
	}
?>

</body>
</html>
