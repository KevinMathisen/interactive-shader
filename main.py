
import math

# y is from top to bottom, x is from left to right
def calculate_motor_rot(x, y, max_x, max_y):
	
	# invalid coordinates
	if (x < 0 or x > max_x or y < 0 or y > max_y):
		return 0, max_x

	# calculate length of rope
	len_motor_1 = math.sqrt(x*x+y*y)
	len_motor_2 = math.sqrt((max_x-x)*(max_x-x)+y*y)
	
	# make sure rope is not to short
	if (len_motor_1+len_motor_2) < max_x:
		return 0, max_x


	return len_motor_1, len_motor_2