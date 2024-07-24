import NavBar from "../Components/NavBar";

function Popular() {
	return (
		<div>
			<NavBar fixed={true} />
			<div>
				<div className="hiddem h-screen">
					
					<picture>
						<source
							srcSet="https://via.placeholder.com/1920x1080"
							sizes="100vh"
							media="(min-width: 1024px)"
						/>
						<img
							src="https://via.placeholder.com/640x360"
							sizes="100vh"
							alt="Placeholder"
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								height: "100%",
								width: "100%",
								transform: "translate(-50%, -50%)",
								objectFit: "cover",
								objectPosition: "center",
							}}
						/>
					</picture>
				</div>
			</div>
		</div>
	);
}

export default Popular;
